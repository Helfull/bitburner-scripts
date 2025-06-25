import { NetscriptPort } from 'NetscriptDefinitions';

export type MessageSchema<DataType = any> = {
  type: string,
  parse: (data: string) => DataType | null,
  data?: DataType,
  evaluate?: (data: DataType) => boolean,
};

type OutgoingMessage<T> = Omit<T, 'parse' | 'evaluate'>;

export class Protocol<T extends MessageSchema<any>> {

  protected portHandle: NetscriptPort

  protected messageTypes: T[];

  constructor(
    protected readonly ns: NS,
    protected readonly port: number,
    protected readonly options: { debug?: boolean } = { debug: false }
  ) {}

  get handle(): NetscriptPort {
    if (!this.portHandle) {
      this.portHandle = this.ns.getPortHandle(this.port);
    }
    return this.portHandle;
  }

  async send(data: OutgoingMessage<T>): Promise<boolean> {
    return this.handle.tryWrite(JSON.stringify(data));
  }

  registerMessageType(message: T): void {
    if (!this.messageTypes) {
      this.messageTypes = [];
    }
    this.messageTypes.push(message);
  }

  async hasData(): Promise<boolean> {
    return this.handle.peek() !== 'NULL PORT DATA';
  }

  async receive(): Promise<T | null> {
    if (!(await this.hasData())) {

      if (this.options.debug) {
        this.ns.print(`No data available on port ${this.port}`);
      }

      return null;
    }

    let data = this.handle.read();
    if (data === 'NULL PORT DATA') {

      this.printDebug(`No data available on port ${this.port}`);

      return null;
    }

    try {
      data = JSON.parse(data);
    } catch (e) {
      this.printDebug(`Error parsing data from port ${this.port}: ${e}`);
      return null;
    }

    try {

      this.printDebug(`Received data from port ${this.port}: ${JSON.stringify(data)}`);

      if (this.messageTypes && this.messageTypes.length > 0) {
        for (const messageType of this.messageTypes) {
          this.printDebug(`Checking message type ${messageType.type} against data type ${data.type} on port ${this.port}`);
          if (messageType.type === data.type) {
            let messageData = data.data;
            if (messageType.parse) {
              messageData = messageType.parse(data.data);
            }

            this.printDebug(`Received data from port ${messageData}`);

            if (messageType.evaluate && messageType.evaluate(messageData)) {
              this.printDebug(`Data matches type ${messageType.type} on port ${this.port}`);
              return { ...data, data: messageData };
            } else {
              this.printDebug(`Data does not match evaluation for type ${messageType.type} on port ${this.port}`);
            }
          } else {
            this.printDebug(`Data type ${data.type} does not match registered type ${messageType.type} on port ${this.port}`);
          }
        }
      } else {
        return data;
      }
    } catch (e) {
      this.printDebug(`Error parsing message data from port ${this.port}: ${e}`);
      this.printDebug(`${JSON.stringify(data)}`);
    }

    this.printDebug(`No matching message type found for data on port ${this.port}: ${data}`);

    return null;
  }

  printDebug(message: string): void {
    if (this.options.debug) {
      this.ns.print(`[Protocol Debug] ${message}`);
    }
  }

}
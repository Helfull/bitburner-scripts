import { NetscriptPort } from 'NetscriptDefinitions';

export class Port {

  protected handle: NetscriptPort;

  protected disconnectCallbacks: Set<() => void>;

  protected dataCallbacks: ((data: any) => void)[];

  protected listenHandler: number;

  constructor(
    protected ns: NS,
    private readonly port: number
  ) {}

  connect() {
    this.handle = this.ns.getPortHandle(this.port);

    this.listenHandler = setInterval(() => {
      while(!this.handle.empty()) {
        const data = this.handle.peek();

        const ack = this.dataCallbacks.some((callback) => callback(data));
      }
    });
  }

  onDisconnect(cb: () => void) {
    this.disconnectCallbacks.add(cb);
  }

  disconnect() {
    this.handle = null;
    this.disconnectCallbacks.forEach((c) => c());
  }

  async write(data: any) {
    while(! this.handle.tryWrite(data)) {
      await this.ns.sleep(100)
    }
  }

  onData(cb: (data: any) => void) {
    this.dataCallbacks.push(cb);
  }
}
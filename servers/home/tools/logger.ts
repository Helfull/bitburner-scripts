export class Logger {
  constructor(private ns: NS) {}

  public log(message: string, ...args: any[]) {
    this.printf('OKAY | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public error(message: string, ...args: any[]) {
    this.printf('ERROR | [%s] %s', this.getDate(), this.sprintf(message, ...args));;
  }

  public info(message: string, ...args: any[]) {
    this.printf('INFO | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public warn(message: string, ...args: any[]) {
    this.printf('WARN | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  protected getDate() {
    return (new Date(Date.now())).toISOString();
  }

  protected sprintf(message: string, ...args: any[]) {
    try {
      return this.ns.sprintf(message, ...args);
    } catch(e) {
      this.ns.print(`ERROR | Failed to sprintf message: ${message}`);
      return message;
    }
  }

  protected printf(message: string, ...args: any[]) {
    try {
      this.ns.printf(message, ...args);
    } catch(e) {
      this.ns.print(`ERROR | Failed to printf message: ${message}`);
      return message;
    }
  }
}

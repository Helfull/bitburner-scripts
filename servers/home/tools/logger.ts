import { Color } from '@lib/colors';

export class Logger {
  protected options = {
    levels: ['log', 'error', 'info', 'warn', 'debug', 'success'],
    outputFunction: 'printf',
    escalateLevels: ['error'],
  };

  constructor(private ns: NS, options: Partial<Logger['options']> = {}) {
    Object.assign(this.options, options);
  }

  public log(message: string, ...args: any[]) {
    this.escalate(message, 'log');
    if (!this.options.levels.includes('log')) return;
    this.printf('OKAY | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public error(message: string, ...args: any[]) {
    this.escalate(message, 'error');
    if (!this.options.levels.includes('error')) return;
    this.printf('ERROR | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public info(message: string, ...args: any[]) {
    this.escalate(message, 'info');
    if (!this.options.levels.includes('info')) return;
    this.printf('INFO | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public warn(message: string, ...args: any[]) {
    this.escalate(message, 'warn');
    if (!this.options.levels.includes('warn')) return;
    this.printf('WARN | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  public debug(message: string, ...args: any[]) {
    this.escalate(message, 'debug');
    if (!this.options.levels.includes('debug')) return;
    this.printf(Color.bold.white.wrap('DEBUG | [%s] %s'), this.getDate(), this.sprintf(message, ...args));
  }

  public success(message: string, ...args: any[]) {
    this.escalate(message, 'success');
    if (!this.options.levels.includes('success')) return;
    this.printf('SUCCESS | [%s] %s', this.getDate(), this.sprintf(message, ...args));
  }

  protected getDate() {
    return new Date(Date.now()).toISOString();
  }

  protected sprintf(message: string, ...args: any[]) {
    try {
      return this.ns.sprintf(message, ...args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)));
    } catch (e) {
      this.ns.print(`ERROR | Failed to sprintf message: ${message}`);
      return message;
    }
  }

  protected printf(message: string, ...args: any[]) {
    try {
      this.ns[this.options.outputFunction](message, ...args);
    } catch (e) {
      this.ns.print(`ERROR | Failed to printf message: ${message}`);
      return message;
    }
  }

  protected escalate(level: string, message: string, ...args: any[]) {
    if (!this.options.escalateLevels.includes(level)) return;
    this.ns.tprintf(Color.red.bold.wrap(`${level} | ESCALATE | ${this.sprintf(message, ...args)}`));
  }
}

import { Color } from '@lib/colors';

export class Logger {
  protected options = {
    service: 'default',
    levels: ['log', 'error', 'info', 'warn', 'debug', 'success'],
    outputFunction: 'printf',
    output: 'cli',
    escalateLevels: ['error'],
  };

  constructor(private ns: NS, options: Partial<Logger['options']> = {}) {
    Object.assign(this.options, {
      service: ns.getScriptName() + ' PID: ' + ns.pid,
    }, options);
  }

  public log(message: string, ...args: any[]) {
    this.escalate(message, 'log');
    if (!this.options.levels.includes('log')) return;
    this.print('OKAY', this.sprintf(message, ...args));
  }

  public error(message: string, ...args: any[]) {
    this.escalate(message, 'error');
    if (!this.options.levels.includes('error')) return;
    this.print('ERROR', this.sprintf(message, ...args));
  }

  public info(message: string, ...args: any[]) {
    this.escalate(message, 'info');
    if (!this.options.levels.includes('info')) return;
    this.print('INFO', this.sprintf(message, ...args));
  }

  public warn(message: string, ...args: any[]) {
    this.escalate(message, 'warn');
    if (!this.options.levels.includes('warn')) return;
    this.print('WARN', this.sprintf(message, ...args));
  }

  public debug(message: string, ...args: any[]) {
    this.escalate(message, 'debug');
    if (!this.options.levels.includes('debug')) return;
    this.print(Color.bold.white.wrap('DEBUG'), this.sprintf(message, ...args));
  }

  public success(message: string, ...args: any[]) {
    this.escalate(message, 'success');
    if (!this.options.levels.includes('success')) return;
    this.print('SUCCESS', this.sprintf(message, ...args));
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

  protected print(level: string, message: string, ...args: any[]) {
    return this.printf('%s | %s | [%s] %s', level, this.getDate(), this.options.service, message, ...args);
  }

  protected printf(message: string, ...args: any[]) {
    try {
      switch(this.options.output) {
        case 'cli':
          this.ns[this.options.outputFunction](message, ...args);
          break;
        default:
          if (!this.ns.fileExists(this.options.output)) {
            this.ns.write(this.options.output, '', 'w');
          }
          this.ns.write(this.options.output, this.ns.sprintf(message, ...args) + '\n', 'a');
      }
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

import { NS } from '@ns';

export class Logger {
  constructor(
    private ns: NS,
    private readonly namespace: string = 'DEFAULT',
  ) {}

  public info(message: string): void {
    this.ns.tprintf('INFO | [%s][%s] %s', this.namespace, new Date(Date.now()).toISOString(), message);
  }

  public error(message: string): void {
    this.ns.tprintf('ERROR | [%s][%s] %s', this.namespace, new Date(Date.now()).toISOString(), message);
  }

  public warn(message: string): void {
    this.ns.tprintf('WARN | [%s][%s] %s', this.namespace, new Date(Date.now()).toISOString(), message);
  }

  public debug(message: string): void {
    this.ns.tprintf('DEBUG | [%s][%s] %s', this.namespace, new Date(Date.now()).toISOString(), message);
  }
}
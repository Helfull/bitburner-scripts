import { Logger } from '@/servers/home/tools/logger';

export class Lock
{
  constructor(
    public ns: NS,
    private target: string,
    private log: null | Logger = null
  ) {}

  async lock() {
    this.log?.info(`Locking ${this.ns.getHostname()}`);
    while(this.isLocked()) {
      this.log?.info(`awaiting ${this.ns.getHostname()} unlock`);
      await this.ns.sleep(100);
    }

    this.ns.write(this.lockFile() , JSON.stringify({
      pid: this.ns.pid,
      owner: this.ns.getHostname(),
    }, null, 2), 'w');

    this.log?.success(`Locked ${this.ns.getHostname()}`);
  }

  unlock() {
    this.ns.rm(this.lockFile());
  }

  isLocked() {
    return this.ns.fileExists(this.lockFile());
  }

  private lockFile(): string {
    return `servers/${this.target}.lock.json`;
  }
}
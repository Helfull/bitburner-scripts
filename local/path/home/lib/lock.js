// servers/home/lib/lock.ts
var Lock = class {
  constructor(ns, target) {
    this.ns = ns;
    this.target = target;
  }
  async lock() {
    while (this.isLocked()) {
      await this.ns.sleep(100);
    }
    this.ns.write(this.lockFile(), JSON.stringify({
      pid: this.ns.pid,
      owner: this.ns.getHostname()
    }, null, 2), "w");
  }
  unlock() {
    this.ns.rm(this.lockFile());
  }
  isLocked() {
    return this.ns.fileExists(this.lockFile());
  }
  lockFile() {
    return `servers/${this.target}.lock.json`;
  }
};
export {
  Lock
};

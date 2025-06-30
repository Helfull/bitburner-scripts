import { getServers } from '@lib/utils';
import { HAS_ADMIN_ACCESS } from '@/servers/home/server/filter';
import { Server } from '@/servers/home/batcher/Server';
import { Job } from '@/servers/home/batcher/Job';

class Block {
  constructor(
    public maxRam: number,
    public usedRam: number,
    public jobs: Job[] = []
  ) {}

  get availableRam(): number {
    return this.maxRam - this.usedRam - this.jobs.reduce((total, job) => total + job.requiredRam, 0);
  }
}

export class RAMManager {

  protected blocks = [];

  constructor(private ns: NS) {
    this.setupBlocks();
  }

  assign(job: Job): boolean {
    const block = this.findBlock(job);

    return false;
  }

  findBlock(job: Job): Job | false {

  }

  setupBlocks(): void {
    this.blocks = this.getServers().map(server => {
      return new Block(server.maxRam, server.usedRam);
    });
  }

  getCurrentAvailableRAM(): number {
    return this.getServers().reduce((total, server) => {
      return total + server.availableRam;
    }, 0);
  }

  getServers(): Server[] {
    return getServers(this.ns)
      .filter(HAS_ADMIN_ACCESS(this.ns))
      .map(server => new Server(this.ns, server));
  }

}
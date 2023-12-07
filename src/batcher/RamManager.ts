import { NS, Server } from '@ns'

type ServerBlock = {
  server: string;
  ram: number;
  maxRam: () => number;
  usedRam: () => number;
}

export type Block = {
  server: string;
  ramReq: number;
}

export class RAMManager {
  private blocks: ServerBlock[] = [];

  constructor(ns: NS, servers: Server[]) {
    this.blocks = servers
      .filter(s => s.hasAdminRights)
      .map((s) => {
        return {
          server: s.hostname,
          ram: s.maxRam - s.ramUsed,
          maxRam: () => ns.getServerMaxRam(s.hostname),
          usedRam: () => ns.getServerUsedRam(s.hostname),
          s,
        };
      });
  }

  reavaluate() {
    this.blocks = this.blocks
      .map((s) => {
        s.ram = s.maxRam() - s.usedRam();
        return s;
      });
  }

  assign(blockJob: Block) {
    this.reavaluate();

    const block = this.blocks.find((b) => b.ram >= blockJob.ramReq);
    if (!block) {
      return false;
    }
    blockJob.server = block.server;
    block.ram -= blockJob.ramReq;

    return true;
  }

  getBiggestBlock() {
    return this.blocks.reduce((acc, cur) => acc.ram > cur.ram ? acc : cur);
  }

  getSmallestBlock() {
    return this.blocks.reduce((acc, cur) => (acc.ram < cur.ram || cur.ram == 0) ? acc : cur);
  }

  getCountBlocksOfSize(size: number) {
    return this.blocks
      .filter(b => b.ram >= size)
      .reduce((acc, cur) => acc + Math.floor(cur.ram / size), 0);
  }

  get totalRam() {
    return Object.values(this.blocks).reduce((acc, cur) => acc + cur.ram, 0);
  }

  toString() {
    return `RAMManager: \nTotal Ram: ${this.totalRam}\n${JSON.stringify(this.blocks)}`;
  }

}
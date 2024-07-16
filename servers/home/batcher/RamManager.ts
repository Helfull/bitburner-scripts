import { Server } from '../../../NetscriptDefinitions';
import { Color } from '../colors';
import { config } from '../config';
import { Logger } from '../tools/logger';

export type ServerBlock = {
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
  protected blocks: ServerBlock[] = [];

  constructor(protected ns: NS, servers: Server[], protected log = new Logger(ns)) {
    this.blocks = this.mapServers(servers
      .filter(s => s.hasAdminRights));

    if (this.blocks.length === 0) {
      ns.tprint(Color.red.wrap('No servers with admin rights'));
      ns.exit();
    }
  }

  protected mapServers(servers: Server[]) {
    return servers.map((s) => {
      let maxRam = s.maxRam;

      if (s.hostname === 'home') {
        maxRam = config.homeRamPercentage(s.maxRam);
      }

      return {
        server: s.hostname,
        ram: maxRam - s.ramUsed,
        maxRam: () => this.getServerMaxRam(s.hostname),
        usedRam: () => this.ns.getServerUsedRam(s.hostname),
        s,
      };
    });
  }

  protected getServerMaxRam(server: string) {
    let maxRam = this.ns.getServerMaxRam(server);

    if (server === 'home') {
      maxRam = config.homeRamPercentage(maxRam);
    }

    return maxRam;
  }

  reavaluate(): RAMManager {
    this.blocks = this.blocks
      .map((server) => {
        server.ram = server.maxRam() - server.usedRam();
        return server;
      });

    return this;
  }

  assign(blockJob: Block): boolean {
    this.reavaluate();

    this.log.info(`Block Job: ${blockJob.server} ${this.ns.formatRam(blockJob.ramReq)}`);

    const block = this.blocks
      .sort((a, b) => b.ram - a.ram)
      .find((b) => b.ram >= blockJob.ramReq);
    if (!block) {
      return false;
    }

    this.log.info(`Block: ${block.server} ${this.ns.formatRam(block.ram)}`);

    blockJob.server = block.server;
    block.ram -= blockJob.ramReq;

    return true;
  }

  getBiggestBlock() {
    return this.blocks.sort((a, b) => b.ram - a.ram).find(x=>x!==undefined);
  }

  getSmallestBlock() {
    return this.blocks.reduce((acc, cur) => (acc.ram < cur.ram || cur.ram == 0) ? acc : cur);
  }

  getCountBlocksOfSize(size: number) {
    return this.blocks
      .filter(b => b.ram >= size)
      .reduce((acc, cur) => acc + Math.floor(cur.ram / size), 0);
  }

  get all(): ServerBlock[] {
    return this.blocks
  }

  get totalRam() {
    return Object.values(this.blocks).reduce((acc, cur) => acc + cur.ram, 0);
  }

  toString() {
    return `RAMManager: \nTotal Ram: ${this.totalRam}\n${JSON.stringify(this.blocks)}`;
  }

}

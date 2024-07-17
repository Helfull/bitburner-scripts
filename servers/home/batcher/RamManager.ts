import { Server } from "../../../NetscriptDefinitions";
import { Color } from "../colors";
import { config } from "../config";
import { Logger } from "../tools/logger";

export type ServerBlock = {
  server: string;
  ram: number;
  maxRam: () => number;
  usedRam: () => number;
};

export type Block = {
  server: string;
  ramReq: number;
  threads: number;
  threadSize: number;
};

export type AssignedBlock = {
  ramBlocks: Block[];
  jobBlock: Block;
  threads: number;
  ramTotal: number;
};

export class RAMManager {
  protected blocks: ServerBlock[] = [];

  constructor(
    protected ns: NS,
    servers: Server[],
    protected log = new Logger(ns)
  ) {
    this.blocks = this.mapServers(servers.filter((s) => s.hasAdminRights));

    if (this.blocks.length === 0) {
      ns.tprint(Color.red.wrap("No servers with admin rights"));
      ns.exit();
    }
  }

  protected mapServers(servers: Server[]) {
    return servers.map((s) => {
      let maxRam = s.maxRam;

      if (s.hostname === "home") {
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

    if (server === "home") {
      maxRam = config.homeRamPercentage(maxRam);
    }

    return maxRam;
  }

  reavaluate(): RAMManager {
    this.blocks = this.blocks.map((server) => {
      server.ram = server.maxRam() - server.usedRam();
      return server;
    });

    return this;
  }

  assign(blockJob: Block): AssignedBlock | false {
    this.log.info(
      `Block Job: ${blockJob.server} ${this.ns.formatRam(
        blockJob.ramReq
      )} | Threads: ${blockJob.threads} ThreadSize: ${blockJob.threadSize}`
    );

    this.reavaluate();

    if (blockJob.ramReq > this.totalRam) {
      this.log.warn(
        `Not enough total RAM to assign block ${this.ns.formatRam(
          blockJob.ramReq
        )}`
      );
      return false;
    }

    const biggestBlock = this.getBiggestBlock();

    // If the biggest block has enough ram, assign it
    if (biggestBlock.ram >= blockJob.ramReq) {
      return this.assignBlockToServer(biggestBlock, blockJob);
    }

    // Find the first block that has enough ram
    const block = this.blocks
      .sort((a, b) => b.ram - a.ram)
      .find((b) => b.ram >= blockJob.ramReq);

    if (block) return this.assignBlockToServer(block, blockJob);

    // If no single block has enough ram, try to split the block into multiple blocks and assign
    const minBlockSize = blockJob.threadSize;
    let numThreads = blockJob.threads;
    let assignedBlock: AssignedBlock = null;

    while (numThreads > 0) {
      const nextBlock = this.blocks
        .sort((a, b) => b.ram - a.ram)
        .find((b) => b.ram >= minBlockSize);

      if (!nextBlock) {
        this.log.warn(`Not enough blocks to assign ${numThreads} threads`);
        return false;
      }

      const threads = Math.min(
        numThreads,
        Math.floor(nextBlock.ram / blockJob.threadSize)
      );

      if (threads < 1) {
        this.log.warn(`Not enough ram to assign ${numThreads} threads`);
        return false;
      }

      const block = {
        server: nextBlock.server,
        ramReq: threads * blockJob.threadSize,
        threads,
        threadSize: blockJob.threadSize,
      };

      assignedBlock = this.assignBlockToServer(nextBlock, block, assignedBlock);

      numThreads -= threads;

      this.log.info("Threads open: %s", numThreads);
    }

    assignedBlock.jobBlock = blockJob;

    return assignedBlock;
  }

  protected assignBlockToServer(
    serverBlock: ServerBlock,
    block: Block,
    assignedBlock?: AssignedBlock
  ): AssignedBlock {
    this.log.info(
      `Assigning block ${this.ns.formatRam(block.ramReq)} to ${
        serverBlock.server
      }`
    );

    block.server = serverBlock.server;
    serverBlock.ram -= block.ramReq;

    const newAssignedBlock: AssignedBlock = assignedBlock || {
      jobBlock: block,
      ramBlocks: [],
      threads: 0,
      ramTotal: 0,
    };

    newAssignedBlock.ramBlocks.push(block);
    newAssignedBlock.threads += block.threads;
    newAssignedBlock.ramTotal += block.ramReq;

    return newAssignedBlock;
  }

  getBiggestBlock() {
    return this.blocks
      .sort((a, b) => b.ram - a.ram)
      .find((x) => x !== undefined);
  }

  getSmallestBlock() {
    return this.blocks.reduce((acc, cur) =>
      acc.ram < cur.ram || cur.ram == 0 ? acc : cur
    );
  }

  getCountBlocksOfSize(size: number) {
    return this.blocks
      .filter((b) => b.ram >= size)
      .reduce((acc, cur) => acc + Math.floor(cur.ram / size), 0);
  }

  get all(): ServerBlock[] {
    return this.blocks;
  }

  get totalRam() {
    return Object.values(this.blocks).reduce((acc, cur) => acc + cur.ram, 0);
  }

  toString() {
    return `RAMManager: \nTotal Ram: ${this.totalRam}\n${JSON.stringify(
      this.blocks
    )}`;
  }
}

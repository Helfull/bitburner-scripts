import { NS } from "../../NetscriptDefinitions";
import { Metrics } from "batcher/Metrics";
import type { RAMManager } from "batcher/RamManager";
import { JobRunner } from "batcher/JobRunner";

export class Prepper extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
  ) {
    super(ns, rmm);
    ns.tprint('Prepper initialized');
  }

  /**
   * Preps a target maxing out money and lowering security
   * @param target The target to prep
   */
  async execute(target: string) {
    const prepMetrics = this.metrics.calcPrep(target);
    const biggestRamBlock = this.rmm.getBiggestBlock().ram;

    this.ns.printf('INFO | Target: %s', target);
    this.ns.printf('INFO | Prep Metrics: %s', JSON.stringify(prepMetrics));
    this.ns.printf('INFO | RAM Blocks: %s', this.rmm.getCountBlocksOfSize(1.75));
    this.ns.printf('INFO | Biggest Blocks: %s', biggestRamBlock / 1.75);
    this.ns.printf('INFO | Smallest Blocks: %s', this.rmm.getSmallestBlock().ram / 1.75);
    this.ns.printf('INFO | Total Blocks required: %s', prepMetrics.wknThreads + prepMetrics.grwThreads + prepMetrics.grwWknThreads);

    await this.batchJob({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.wknThreads,
      args: {
        target,
        additionalMsec: 0,
      },
    });

    await this.batchJob({
      script: "batcher/jobs/grow.js",
      threads: prepMetrics.grwThreads,
      args: {
        target,
        additionalMsec: 0,
      },
    });

    await this.batchJob({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.grwWknThreads,
      args: {
        target,
        additionalMsec: 0,
      }
    });
  }
}
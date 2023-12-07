import { NS } from "@ns";
import { Metrics } from "batcher/Metrics";
import { JobRunner } from "batcher/JobRunner";
import type { RAMManager } from "batcher/RamManager";

export class BatchRunner extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
  ) {
    super(ns, rmm);
  }

  async execute(target: string, startDelay = 0) {
    const batchMetrics = this.metrics.calcBatch(target, 0.1, startDelay);

    this.ns.printf('INFO | Target: %s', target);
    this.ns.printf('INFO | Metrics:');
    this.ns.printf('INFO | %s', JSON.stringify(batchMetrics, null, 2));

    await this.dispatch({
      script: 'batcher/jobs/hack.js',
      threads: batchMetrics.hckThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.hack,
      },
      block: {
        server: target,
        ramReq: batchMetrics.hckThreads * 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/weaken.js',
      threads: batchMetrics.hckWknThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.weakenHack,
      },
      block: {
        server: target,
        ramReq: batchMetrics.hckWknThreads * 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/grow.js',
      threads: batchMetrics.grwThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.grow,
      },
      block: {
        server: target,
        ramReq: batchMetrics.grwThreads * 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/weaken.js',
      threads: batchMetrics.grwWknThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.weakenGrow,
      },
      block: {
        server: target,
        ramReq: batchMetrics.grwWknThreads * 1.75,
      },
    });

    return batchMetrics.finishTimes;
  }
}
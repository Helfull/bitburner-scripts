import { NS } from "@ns";
import { Metrics } from "batcher/Metrics";
import { Logger } from "lib/logger";

export type BatchRun = {
  start: number;
  finish: number;
  target: string;
  pids: number[];
}

export class Batch {

  constructor(
    private readonly ns: NS,
    private readonly metrics: Metrics = new Metrics(ns),
    private readonly logger: Logger = new Logger(ns, 'BATCH'),
  ) {
  }

  runBatch(slave: string, target: string, startDelay = 0, batchId: any = 0): BatchRun {
    const batchMetrics = this.metrics.calcBatch(target, 0.1, startDelay);

    this.logger.info(this.ns.sprintf('Target: %s', target));
    this.logger.info('Metrics:');
    this.logger.debug(JSON.stringify(batchMetrics, null, 2));

    const pids = [
      this.ns.exec('scripts/batch/hack.js', slave, batchMetrics.hckThreads, batchMetrics.delays.hack, target, `${startDelay} / ${batchId}`),
      this.ns.exec('scripts/batch/weaken.js', slave, batchMetrics.hckWknThreads, batchMetrics.delays.weakenHack, target, `${startDelay} / ${batchId}`),
      this.ns.exec('scripts/batch/grow.js', slave, batchMetrics.grwThreads, batchMetrics.delays.grow, target, `${startDelay} / ${batchId}`),
      this.ns.exec('scripts/batch/weaken.js', slave, batchMetrics.grwWknThreads, batchMetrics.delays.weakenGrow, target, `${startDelay} / ${batchId}`),
    ];

    return {
      start: Date.now() + startDelay,
      finish: Date.now() + batchMetrics.finishTimes.weakenGrow,
      target,
      pids,
    }
  }
}
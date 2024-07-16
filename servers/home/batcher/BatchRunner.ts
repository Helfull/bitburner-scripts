import { Logger } from "../tools/logger";
import { JobRunner } from "./JobRunner";
import { Metrics } from "./Metrics";
import { RAMManager } from "./RamManager";

export class BatchRunner extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
    protected readonly log = new Logger(ns),
  ) {
    super(ns, rmm, log);
  }

  async execute(target: string, startDelay = 0) {
    const batchMetrics = this.metrics.calcBatch(target, 0.1, startDelay);

    this.log.info('Target: %s', target);
    this.log.info('Metrics:');
    this.log.info('%s', JSON.stringify(batchMetrics, null, 2));

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

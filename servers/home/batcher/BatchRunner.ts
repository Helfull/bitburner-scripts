import { Logger } from '../tools/logger';
import { JobRunner } from './JobRunner';
import { Metrics, MetricsData } from './Metrics';
import { RAMManager } from './RamManager';

export type BatchConfig = {
  greed: number;
};

export class BatchRunner extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
    protected readonly log = new Logger(ns),
    protected readonly config: BatchConfig = { greed: 0.1 },
  ) {
    super(ns, rmm, log);
  }

  async execute(target: string, batchId: number | string = 0): Promise<MetricsData> {
    const batchMetrics = this.metrics.calcBatch(target, this.config.greed);

    this.log.info('Target: %s', target);
    this.log.info('Metrics:');
    this.log.info('%s', JSON.stringify(batchMetrics, null, 2));

    await this.dispatch({
      script: 'batcher/jobs/hack.js',
      threads: batchMetrics.threads.hack,
      args: {
        type: 'hack',
        target,
        batchId,
        controllerPort: this.ns.pid,
      },
      timings: {
        end: batchMetrics.ends.hack,
        duration: batchMetrics.times.hack,
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.hack * 1.75,
        threads: batchMetrics.threads.hack,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/weaken.js',
      threads: batchMetrics.threads.weaken,
      args: {
        type: 'weaken',
        target,
        batchId,
        controllerPort: this.ns.pid,
      },
      timings: {
        end: batchMetrics.ends.weaken,
        duration: batchMetrics.times.weaken,
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.weaken * 1.75,
        threads: batchMetrics.threads.weaken,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/grow.js',
      threads: batchMetrics.threads.grow,
      args: {
        type: 'grow',
        target,
        batchId,
        controllerPort: this.ns.pid,
      },
      timings: {
        end: batchMetrics.ends.grow,
        duration: batchMetrics.times.grow,
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.grow * 1.75,
        threads: batchMetrics.threads.grow,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: 'batcher/jobs/weaken.js',
      threads: batchMetrics.threads.weakenGrow,
      args: {
        type: 'weakenGrow',
        target,
        batchId,
        controllerPort: this.ns.pid,
        reportFinish: true,
      },
      timings: {
        end: batchMetrics.ends.weakenGrow,
        duration: batchMetrics.times.weakenGrow,
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.weakenGrow * 1.75,
        threads: batchMetrics.threads.weakenGrow,
        threadSize: 1.75,
      },
    });

    return batchMetrics;
  }
}

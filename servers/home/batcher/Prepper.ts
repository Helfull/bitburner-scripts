import { Logger } from "../tools/logger";
import { JobRunner, RunnerError } from "./JobRunner";
import { Metrics } from "./Metrics";
import { RAMManager } from "./RamManager";

export class Prepper extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
    protected readonly log = new Logger(ns),
  ) {
    super(ns, rmm, log);
  }

  /**
   * Preps a target maxing out money and lowering security
   * @param target The target to prep
   */
  async execute(target: string) {
    this.log.info('Target: %s', target);
    const prepMetrics = this.metrics.calcPrep(target);
    this.log.info('Prep Metrics: %s', JSON.stringify(prepMetrics));
    await this.ns.asleep(100);

    if (! await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.wknThreads,
      args: {
        target,
        additionalMsec: prepMetrics.finishTimes.weaken,
      },
      block: {
        server: target,
        ramReq: prepMetrics.wknThreads * 1.75,
      },
    })) {
      throw new RunnerError("Failed to dispatch weaken job");
    }

    if (! await this.dispatch({
      script: "batcher/jobs/grow.js",
      threads: prepMetrics.grwThreads,
      args: {
        target,
        additionalMsec: prepMetrics.finishTimes.grow,
      },
      block: {
        server: target,
        ramReq: prepMetrics.grwThreads * 1.75,
      },
    })) {
      throw new RunnerError("Failed to dispatch grow job");
    }

    if (! await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.grwWknThreads,
      args: {
        target,
        additionalMsec: prepMetrics.finishTimes.weakenGrow,
      },
      block: {
        server: target,
        ramReq: prepMetrics.grwWknThreads * 1.75,
      },
    })) {
      throw new RunnerError("Failed to dispatch grow weaken job");
    }

    this.log.info('Waiting for jobs to finish');
    const finishTime = Math.max(...Object.values(prepMetrics.finishTimes));
    this.log.info('Sleeping for %s', this.ns.tFormat(finishTime));
    await this.ns.sleep(finishTime);

    this.log.info('Prepping %s finished', target);
  }
}

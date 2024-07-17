import { Logger } from "../tools/logger";
import { JobRunner, RunnerError } from "./JobRunner";
import { Metrics } from "./Metrics";
import { RAMManager } from "./RamManager";

export class Prepper extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
    protected readonly log = new Logger(ns)
  ) {
    super(ns, rmm, log);
  }

  async execute(target: string) {
    this.log.info("Target: %s", target);
    const prepMetrics = this.metrics.calcPrep(target);
    this.log.info("Prep Metrics: %s", JSON.stringify(prepMetrics));
    await this.ns.asleep(100);

    await this.run({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.wknThreads,
      args: {
        target,
        additionalMsec: prepMetrics.finishTimes.weaken,
      },
      block: {
        server: target,
        ramReq: prepMetrics.wknThreads * 1.75,
        threadSize: 1.75,
        threads: prepMetrics.wknThreads,
      },
    });

    while (prepMetrics.grwThreads > 0) {
      const perIterationThreads = Math.min(
        prepMetrics.grwThreads,
        Math.floor(this.rmm.getBiggestBlock().ram / 1.75)
      );
      this.ns.printf("INFO | Threads: %s", prepMetrics.grwThreads);
      this.ns.printf("INFO | Per Iteration Threads: %s", perIterationThreads);
      const growWknThreads =
        this.metrics.calcGrowWknThreads(perIterationThreads);
      this.ns.printf("INFO | Grow Weaken Threads: %s", growWknThreads);

      const growResult = await this.run({
        script: "batcher/jobs/grow.js",
        threads: perIterationThreads,
        args: {
          target,
          additionalMsec: 0,
        },
        block: {
          server: target,
          ramReq: perIterationThreads * 1.75,
          threads: perIterationThreads,
          threadSize: 1.75,
        },
      });

      if (!growResult) {
        throw new RunnerError("Failed to run grow");
      }

      prepMetrics.grwThreads -= perIterationThreads;

      const wknResult = await this.run({
        script: "batcher/jobs/weaken.js",
        threads: growWknThreads,
        args: {
          target,
          additionalMsec: 0,
        },
        block: {
          server: target,
          ramReq: growWknThreads * 1.75,
          threads: growWknThreads,
          threadSize: 1.75,
        },
      });

      if (!wknResult) {
        throw new RunnerError("Failed to run weaken");
      }
    }

    this.log.info("Waiting for jobs to finish");
    const finishTime = Math.max(...Object.values(prepMetrics.finishTimes));
    this.log.info("Sleeping for %s", this.ns.tFormat(finishTime));
    await this.ns.sleep(finishTime);

    this.log.info("Prepping %s finished", target);
  }
}

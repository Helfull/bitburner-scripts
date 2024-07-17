import { NetscriptPort } from "../../../NetscriptDefinitions";
import { Logger } from "../tools/logger";
import { JobRunner } from "./JobRunner";
import { Metrics } from "./Metrics";
import { RAMManager } from "./RamManager";

export type BatchConfig = {
  greed: number;
};

export class BatchRunner extends JobRunner {
  private portHandle: NetscriptPort;

  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
    protected readonly log = new Logger(ns),
    protected readonly config: BatchConfig = { greed: 0.1 }
  ) {
    super(ns, rmm, log);
  }

  setup() {
    this.log.info("Setting up BatchRunner");

    const handle = this.ns.getPortHandle(this.ns.pid);

    if (handle === null) {
      throw new Error("Failed to get port handle");
    }

    this.portHandle = handle;
  }

  async execute(target: string, startDelay = 0, batchId: number | string = 0) {
    const batchMetrics = this.metrics.calcBatch(
      target,
      this.config.greed,
      startDelay
    );

    this.log.info("Target: %s", target);
    this.log.info("Metrics:");
    this.log.info("%s", JSON.stringify(batchMetrics, null, 2));

    await this.dispatch({
      script: "batcher/jobs/hack.js",
      threads: batchMetrics.hckThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.hack,
        batchId,
        controllerPort: this.ns.pid,
      },
      block: {
        server: target,
        ramReq: batchMetrics.hckThreads * 1.75,
        threads: batchMetrics.hckThreads,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: batchMetrics.hckWknThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.weakenHack,
        batchId,
        controllerPort: this.ns.pid,
      },
      block: {
        server: target,
        ramReq: batchMetrics.hckWknThreads * 1.75,
        threads: batchMetrics.hckWknThreads,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: "batcher/jobs/grow.js",
      threads: batchMetrics.grwThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.grow,
        batchId,
        controllerPort: this.ns.pid,
      },
      block: {
        server: target,
        ramReq: batchMetrics.grwThreads * 1.75,
        threads: batchMetrics.grwThreads,
        threadSize: 1.75,
      },
    });

    await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: batchMetrics.grwWknThreads,
      args: {
        target,
        additionalMsec: batchMetrics.delays.weakenGrow,
        batchId,
        controllerPort: this.ns.pid,
      },
      block: {
        server: target,
        ramReq: batchMetrics.grwWknThreads * 1.75,
        threads: batchMetrics.grwWknThreads,
        threadSize: 1.75,
      },
    });

    return batchMetrics.finishTimes;
  }
}

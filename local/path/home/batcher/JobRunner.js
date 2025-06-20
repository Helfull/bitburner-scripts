// servers/home/batcher/JobRunner.ts
var RunnerError = class _RunnerError extends Error {
  constructor(message) {
    super(message);
    this.name = "_RunnerError";
  }
  static failToExec(script, args) {
    return new _RunnerError(`Failed to execute ${script} with ${args}`);
  }
  static failToAssign(block, blocks) {
    const serverBlocks = blocks.map((b) => ({
      server: b.server,
      ram: b.ram
    }));
    return new _RunnerError(
      `Failed to assign block ${JSON.stringify(block, null, 2)} from ${JSON.stringify(serverBlocks, null, 2)}`
    );
  }
};
var RAMMissingError = class extends RunnerError {
  constructor(message) {
    super(message);
    this.name = "_RAMMissingError";
  }
};
var JobRunner = class {
  constructor(ns, rmm, log, dataPortId = ns.pid, dataPort = ns.getPortHandle(dataPortId)) {
    this.ns = ns;
    this.rmm = rmm;
    this.log = log;
    this.dataPortId = dataPortId;
    this.dataPort = dataPort;
  }
  /**
   * Run a job in batches
   * @param job The job to run
   */
  async batchJob(job) {
    const scriptRam = this.ns.getScriptRam(job.script);
    this.ns.printf("INFO | Script: %s", job.script);
    this.ns.printf("INFO | Script RAM: %s", scriptRam);
    const perIterationThreads = Math.min(job.threads, Math.floor(this.rmm.getBiggestBlock().ram / scriptRam));
    this.ns.printf("INFO | Threads: %s", job.threads);
    const iterationsReq = Math.ceil(job.threads / perIterationThreads);
    this.ns.printf("INFO | Per Iteration Threads: %s", perIterationThreads);
    await this.ns.asleep(100);
    for (let i = 0; i < iterationsReq; i++) {
      await this.run({
        script: job.script,
        threads: perIterationThreads,
        args: job.args || {},
        block: {
          server: "NULL SERVER",
          ramReq: perIterationThreads * scriptRam,
          threads: perIterationThreads,
          threadSize: scriptRam
        }
      });
    }
  }
  /**
   * Run a job
   * @param job The job to run
   * @returns TRUE if successful, FALSE if not
   */
  async run(job, wait = true) {
    if (job.threads <= 0)
      return true;
    const block = job.block;
    this.log.info("Assigning block: %s", JSON.stringify(block));
    const jobAssignedBlocks = this.rmm.assign(block);
    if (jobAssignedBlocks === false) {
      throw RAMMissingError.failToAssign(block, this.rmm.all);
    }
    this.ns.printf(
      "INFO | Assigning %s [%s] to %s with %s threads",
      job.script,
      JSON.stringify(job.args),
      jobAssignedBlocks.ramBlocks.map((b) => b.server).join(", "),
      job.threads
    );
    const pids = [];
    const jobRunning = {
      ...job,
      timings: {
        now: Date.now(),
        end: Date.now() + (job.timings?.end ?? 0),
        duration: job.timings?.duration ?? 0
      }
    };
    this.log.info("Timings: %s", JSON.stringify(jobRunning.timings));
    for (const ramBlock of jobAssignedBlocks.ramBlocks) {
      this.log.info("Running %s on %s with %s threads", jobRunning.script, ramBlock.server, ramBlock.threads);
      this.ns.scp(job.script, ramBlock.server, "home");
      const pid = this.ns.exec(
        jobRunning.script,
        ramBlock.server,
        { threads: ramBlock.threads, temporary: true },
        JSON.stringify(jobRunning),
        "--cli"
      );
      if (pid === 0) {
        this.log.error(
          '[%s][JOB_RUNNER_EXEC_SCRIPT_FAILED] Failed to exec %s with "%s" on %s (Threads: %s)',
          this.ns.pid,
          jobRunning.script,
          JSON.stringify(jobRunning.args),
          ramBlock.server,
          ramBlock.threads
        );
        this.log.error("Job: %s", JSON.stringify(jobRunning));
        throw RunnerError.failToExec(jobRunning.script, JSON.stringify({ jobRunning }));
      }
      pids.push({ server: ramBlock.server, pid });
    }
    while (wait && pids.some(({ pid }) => this.ns.isRunning(pid))) {
      this.ns.printf(
        "Waiting for %s to finish on [%s]! [%s]",
        jobRunning.script,
        pids.filter(({ pid }) => this.ns.isRunning(pid)).map(({ server }) => server),
        JSON.stringify(jobRunning.args)
      );
      await this.ns.asleep(5e3);
    }
    return true;
  }
  async dispatch(job) {
    return this.run(job, false);
  }
};
export {
  JobRunner,
  RAMMissingError,
  RunnerError
};

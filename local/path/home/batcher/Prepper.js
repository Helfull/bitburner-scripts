// servers/home/lib/colors.ts
var Colors = class {
  fgColor = "";
  bgColor = "";
  styleStack = [];
  constructor() {
    addFgColor("black", "0");
    addFgColor("yellow", "3");
    addFgColor("pink", "5");
    addFgColor("grey", " 244");
    addFgColor("red", "9");
    addFgColor("green", "10");
    addFgColor("white", "15");
    addBgColor("red", "1");
    addBgColor("green", "2");
    addBgColor("yellow", "3");
    addBgColor("white", "15");
  }
  wrap(msg) {
    const elements = [this.fgColorCode, this.bgColorCode, ...this.styleStack].filter((x) => x.length > 0);
    const str = `\x1B[${elements.join(";")}m${msg}\x1B[0m`;
    this.fgColor = "";
    this.bgColor = "";
    this.styleStack = [];
    return str;
  }
  unwrap(msg) {
    return msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
  }
  get fgColorCode() {
    return this.fgColor ? `38;5;${this.fgColor}` : "";
  }
  get bgColorCode() {
    return this.bgColor ? `48;5;${this.bgColor}` : "";
  }
  static unwrap(msg) {
    return msg.replace(/\u001b[[(?);]{0,2}(;?\d)*./g, "");
  }
  fg(color) {
    this.fgColor = color.trim();
    return this;
  }
  bg(color) {
    this.bgColor = color.trim();
    return this;
  }
  get bold() {
    this.styleStack.push("1");
    return this;
  }
  get underline() {
    this.styleStack.push("4");
    return this;
  }
  get italic() {
    this.styleStack.push("3");
    return this;
  }
};
var availableFGColors = [];
var availableBGColors = [];
function addFgColor(name, color) {
  if (Object.hasOwn(Colors.prototype, name))
    return;
  availableFGColors.push(name);
  Object.defineProperty(Colors.prototype, name, {
    get() {
      return this.fg(color);
    }
  });
}
function addBgColor(name, color) {
  if (Object.hasOwn(Colors.prototype, name + "BG"))
    return;
  availableBGColors.push(name);
  Object.defineProperty(Colors.prototype, name + "BG", {
    get() {
      return this.bg(color);
    }
  });
}
var Color = new Colors();

// servers/home/tools/logger.ts
var Logger = class {
  constructor(ns, options = {}) {
    this.ns = ns;
    Object.assign(this.options, options);
  }
  options = {
    levels: ["log", "error", "info", "warn", "debug", "success"],
    outputFunction: "printf",
    escalateLevels: ["error"]
  };
  log(message, ...args) {
    this.escalate(message, "log");
    if (!this.options.levels.includes("log"))
      return;
    this.printf("OKAY | [%s] %s", this.getDate(), this.sprintf(message, ...args));
  }
  error(message, ...args) {
    this.escalate(message, "error");
    if (!this.options.levels.includes("error"))
      return;
    this.printf("ERROR | [%s] %s", this.getDate(), this.sprintf(message, ...args));
  }
  info(message, ...args) {
    this.escalate(message, "info");
    if (!this.options.levels.includes("info"))
      return;
    this.printf("INFO | [%s] %s", this.getDate(), this.sprintf(message, ...args));
  }
  warn(message, ...args) {
    this.escalate(message, "warn");
    if (!this.options.levels.includes("warn"))
      return;
    this.printf("WARN | [%s] %s", this.getDate(), this.sprintf(message, ...args));
  }
  debug(message, ...args) {
    this.escalate(message, "debug");
    if (!this.options.levels.includes("debug"))
      return;
    this.printf(Color.bold.white.wrap("DEBUG | [%s] %s"), this.getDate(), this.sprintf(message, ...args));
  }
  success(message, ...args) {
    this.escalate(message, "success");
    if (!this.options.levels.includes("success"))
      return;
    this.printf("SUCCESS | [%s] %s", this.getDate(), this.sprintf(message, ...args));
  }
  getDate() {
    return new Date(Date.now()).toISOString();
  }
  sprintf(message, ...args) {
    try {
      return this.ns.sprintf(message, ...args.map((arg) => typeof arg === "object" ? JSON.stringify(arg) : arg));
    } catch (e) {
      this.ns.print(`ERROR | Failed to sprintf message: ${message}`);
      return message;
    }
  }
  printf(message, ...args) {
    try {
      this.ns[this.options.outputFunction](message, ...args);
    } catch (e) {
      this.ns.print(`ERROR | Failed to printf message: ${message}`);
      return message;
    }
  }
  escalate(level, message, ...args) {
    if (!this.options.escalateLevels.includes(level))
      return;
    this.ns.tprintf(Color.red.bold.wrap(`${level} | ESCALATE | ${this.sprintf(message, ...args)}`));
  }
};

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

// servers/home/batcher/Metrics.ts
var SEC_DEC_WKN = 0.05;
var SEC_INC_HCK = 2e-3;
var SEC_INC_GRW = 4e-3;
var Metrics = class {
  constructor(ns, bufferDelay = 20, offset = 5, log = new Logger(ns)) {
    this.ns = ns;
    this.bufferDelay = bufferDelay;
    this.offset = offset;
    this.log = log;
  }
  calcGrowWeakenThreads(grwThreads) {
    return Math.max(Math.ceil(grwThreads * SEC_INC_GRW / SEC_DEC_WKN), 1);
  }
  calcHackWeakenThreads(hckThreads) {
    return Math.max(Math.ceil(hckThreads * SEC_INC_HCK / SEC_DEC_WKN), 1);
  }
  calcHackThreads(target, amount) {
    return Math.max(Math.floor(this.ns.hackAnalyzeThreads(target, amount)), 1);
  }
  calcHackGrowThreads(target, maxMoney, hackPercent, hackThreads) {
    return this.calcGrowThreads(target, maxMoney, maxMoney - maxMoney * hackPercent * hackThreads);
  }
  calcGrowThreads(target, maxMoney, currentMoneyAmount) {
    return Math.ceil(this.ns.growthAnalyze(target, maxMoney / currentMoneyAmount));
  }
  calcThreads(target, maxMoney, greed) {
    const amount = maxMoney * greed;
    const hackPercent = this.ns.hackAnalyze(target);
    const hackThreads = this.calcHackThreads(target, amount);
    const growThreads = this.calcHackGrowThreads(target, maxMoney, hackPercent, hackThreads);
    const weakenHackThreads = this.calcHackWeakenThreads(hackThreads);
    const weakenGrowThreads = this.calcGrowWeakenThreads(growThreads);
    return {
      hack: hackThreads,
      weaken: weakenHackThreads,
      grow: growThreads,
      weakenGrow: weakenGrowThreads
    };
  }
  calcWeakenTime(target) {
    return this.ns.getWeakenTime(target);
  }
  calcTimes(target) {
    const wknTime = this.calcWeakenTime(target);
    return {
      hack: wknTime / 4,
      weaken: wknTime,
      grow: wknTime * 0.8,
      weakenGrow: wknTime
    };
  }
  calcEnds(times) {
    return {
      hack: times.weaken + this.offset * 0 + this.bufferDelay,
      weaken: times.weaken + this.offset * 1 + this.bufferDelay,
      grow: times.weaken + this.offset * 2 + this.bufferDelay,
      weakenGrow: times.weaken + this.offset * 3 + this.bufferDelay
    };
  }
  calcPrep(target) {
    const curSecurity = this.ns.getServerSecurityLevel(target);
    const minSecurity = this.ns.getServerMinSecurityLevel(target);
    const curMoney = this.ns.getServerMoneyAvailable(target);
    const maxMoney = this.ns.getServerMaxMoney(target);
    const grwThreads = this.calcGrowThreads(target, maxMoney, curMoney);
    const weakenThread = this.ns.weakenAnalyze(1);
    const weakenThreads = Math.max(Math.ceil((curSecurity - minSecurity) / weakenThread), 1);
    const times = this.calcTimes(target);
    const threads = {
      weaken: weakenThreads,
      grow: grwThreads,
      weakenGrow: this.calcGrowWeakenThreads(grwThreads)
    };
    const ends = this.calcEnds(times);
    return {
      times,
      threads,
      ends
    };
  }
  calcGrowWknThreads(grwThreads) {
    return Math.max(Math.ceil(grwThreads * SEC_INC_GRW / SEC_DEC_WKN), 1);
  }
  calcBatch(target, greed = 0.1, ramLimit = false) {
    this.log.debug("Calculating metrics for %s", target);
    this.log.debug("Greed: %s", greed);
    const maxMoney = this.ns.getServerMaxMoney(target);
    const curMoney = this.ns.getServerMoneyAvailable(target);
    this.log.debug("Max Money: %s", this.ns.formatNumber(maxMoney));
    this.log.debug("Cur Money: %s", this.ns.formatNumber(curMoney));
    const minSec = this.ns.getServerMinSecurityLevel(target);
    const sec = this.ns.getServerSecurityLevel(target);
    const times = this.calcTimes(target);
    const ends = this.calcEnds(times);
    const threads = this.calcThreads(target, maxMoney, greed);
    return {
      curMoney,
      maxMoney,
      minSec,
      sec,
      greed,
      threads,
      times,
      ends
    };
  }
};

// servers/home/batcher/Prepper.ts
var Prepper = class extends JobRunner {
  constructor(ns, rmm, metrics = new Metrics(ns), log = new Logger(ns, {
    escalateLevels: ["info", "error"]
  })) {
    super(ns, rmm, log);
    this.ns = ns;
    this.rmm = rmm;
    this.metrics = metrics;
    this.log = log;
  }
  async execute(target) {
    this.log.info("Target: %s", target);
    await this.ns.sleep(1e3);
    const prepMetrics = this.metrics.calcPrep(target);
    this.log.info("Prep Metrics: %s", JSON.stringify(prepMetrics));
    await this.ns.asleep(100);
    let finished = false;
    do {
      try {
        await this.run({
          script: "batcher/jobs/weaken.js",
          threads: prepMetrics.threads.weaken,
          args: {
            target
          },
          block: {
            server: target,
            ramReq: prepMetrics.threads.weaken * 1.75,
            threadSize: 1.75,
            threads: prepMetrics.threads.weaken
          }
        });
        while (prepMetrics.threads.grow > 0) {
          const perIterationThreads = Math.min(
            prepMetrics.threads.grow,
            Math.floor(this.rmm.getBiggestBlock().ram / 1.75)
          );
          this.ns.printf("INFO | Threads: %s", prepMetrics.threads.grow);
          this.ns.printf("INFO | Per Iteration Threads: %s", perIterationThreads);
          const growWknThreads = this.metrics.calcGrowWknThreads(perIterationThreads);
          this.ns.printf("INFO | Grow Weaken Threads: %s", growWknThreads);
          const growResult = await this.run({
            script: "batcher/jobs/grow.js",
            threads: perIterationThreads,
            args: {
              target,
              additionalMsec: 0
            },
            block: {
              server: target,
              ramReq: perIterationThreads * 1.75,
              threads: perIterationThreads,
              threadSize: 1.75
            }
          });
          if (!growResult) {
            throw new RunnerError("Failed to run grow");
          }
          prepMetrics.threads.grow -= perIterationThreads;
          const wknResult = await this.run(
            {
              script: "batcher/jobs/weaken.js",
              threads: growWknThreads,
              args: {
                target,
                additionalMsec: 0
              },
              block: {
                server: target,
                ramReq: growWknThreads * 1.75,
                threads: growWknThreads,
                threadSize: 1.75
              }
            },
            true
          );
          if (!wknResult) {
            throw new RunnerError("Failed to run weaken");
          }
        }
        finished = true;
      } catch (e) {
        this.log.error("Failed to execute prepper: %s", e);
      }
    } while (!finished);
    this.log.info("Waiting for jobs to finish");
  }
};
export {
  Prepper
};

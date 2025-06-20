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

// servers/home/batcher/BatchRunner.ts
var BatchRunner = class extends JobRunner {
  constructor(ns, rmm, metrics = new Metrics(ns), log = new Logger(ns), config2 = { greed: 0.1 }) {
    super(ns, rmm, log);
    this.ns = ns;
    this.rmm = rmm;
    this.metrics = metrics;
    this.log = log;
    this.config = config2;
  }
  async execute(target, batchId = 0) {
    const batchMetrics = this.metrics.calcBatch(target, this.config.greed);
    this.log.info("Target: %s", target);
    this.log.info("Metrics:");
    this.log.info("%s", JSON.stringify(batchMetrics, null, 2));
    await this.dispatch({
      script: "batcher/jobs/hack.js",
      threads: batchMetrics.threads.hack,
      args: {
        type: "hack",
        target,
        batchId,
        controllerPort: this.ns.pid
      },
      timings: {
        end: batchMetrics.ends.hack,
        duration: batchMetrics.times.hack
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.hack * 1.75,
        threads: batchMetrics.threads.hack,
        threadSize: 1.75
      }
    });
    await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: batchMetrics.threads.weaken,
      args: {
        type: "weaken",
        target,
        batchId,
        controllerPort: this.ns.pid
      },
      timings: {
        end: batchMetrics.ends.weaken,
        duration: batchMetrics.times.weaken
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.weaken * 1.75,
        threads: batchMetrics.threads.weaken,
        threadSize: 1.75
      }
    });
    await this.dispatch({
      script: "batcher/jobs/grow.js",
      threads: batchMetrics.threads.grow,
      args: {
        type: "grow",
        target,
        batchId,
        controllerPort: this.ns.pid
      },
      timings: {
        end: batchMetrics.ends.grow,
        duration: batchMetrics.times.grow
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.grow * 1.75,
        threads: batchMetrics.threads.grow,
        threadSize: 1.75
      }
    });
    await this.dispatch({
      script: "batcher/jobs/weaken.js",
      threads: batchMetrics.threads.weakenGrow,
      args: {
        type: "weakenGrow",
        target,
        batchId,
        controllerPort: this.ns.pid,
        reportFinish: true
      },
      timings: {
        end: batchMetrics.ends.weakenGrow,
        duration: batchMetrics.times.weakenGrow
      },
      block: {
        server: target,
        ramReq: batchMetrics.threads.weakenGrow * 1.75,
        threads: batchMetrics.threads.weakenGrow,
        threadSize: 1.75
      }
    });
    return batchMetrics;
  }
};

// servers/home/batcher/ProtoBatcher.ts
var ProtoBatcher = class extends BatchRunner {
  async loop(target) {
    this.log.info("Target: %s", target);
    this.ns.ui.setTailTitle(this.getTitle(target, 0, 0));
    let batchCount = 0;
    let batchesSinceLastError = 0;
    while (true) {
      try {
        this.log.info("Batch %s", batchCount);
        await this.ns.sleep(1e3);
        const metrics = await super.execute(target, batchCount);
        await this.ns.sleep(1e3);
        const finishTime = metrics.ends.weaken;
        this.log.info("Batch expected to finish in %s", this.ns.tFormat(finishTime));
        await this.ns.sleep(1e3);
        batchCount++;
        batchesSinceLastError++;
        this.ns.ui.setTailTitle(this.getTitle(target, batchCount, batchesSinceLastError));
      } catch (e) {
        if (e.name === "_RunnerError") {
          this.ns.ui.setTailTitle(
            this.ns.sprintf("%s, Error: %s", this.getTitle(target, batchCount, batchesSinceLastError), e.message)
          );
          batchesSinceLastError = 0;
          await this.ns.sleep(100);
        } else {
          this.ns.tprint({ error: { name: e.name, message: e.message, stack: e.stack }, pid: this.ns.pid });
          throw e;
        }
      }
    }
  }
  getTitle(target, batchCount, batchesSinceLastError) {
    const script = this.ns.getRunningScript();
    return this.ns.sprintf(
      "Batch %s (%s): %s, %s EXP: %s, MONEY: %s",
      batchCount,
      batchesSinceLastError,
      target,
      Math.round(script.onlineRunningTime),
      this.ns.formatNumber(script.onlineExpGained),
      this.ns.formatNumber(script.onlineMoneyMade)
    );
  }
  async wait() {
    this.log.info("Waiting for finish signal");
    do {
      const portData = this.ns.readPort(this.ns.pid);
      if (portData === "NULL PORT DATA") {
        await this.ns.sleep(1);
        continue;
      }
      try {
        switch (portData.type) {
          case "finish":
            this.log.success("Finish signal received");
            return;
          case "delay":
            this.log.info(
              "Delay signal received job %s is delayed by %s and finishes in %s",
              portData.job.script,
              portData.delay,
              this.ns.tFormat(portData.delay + portData.job.timings.duration, true)
            );
            continue;
          case "hack":
          case "grow":
          case "weaken":
            this.log.info("Received %s signal with result: %s", portData.type, portData.result);
            continue;
          case "late":
            this.log.warn(
              "Late signal received job %s is late by %s and finishes in %s",
              portData.job.script,
              portData.delay,
              this.ns.tFormat(portData.delay + portData.job.timings.duration, true)
            );
            continue;
          default:
            this.log.info("Port data: %s", JSON.stringify(portData, null, 2));
        }
      } catch (e) {
        this.log.error(
          "Failed to parse port data: %s",
          JSON.stringify({
            error: {
              message: e.message,
              stack: e.stack
            },
            portData
          })
        );
      }
    } while (true);
  }
};

// servers/home/config.js
var config = {
  progression: {
    backdoorsRequired: [
      "CSEC",
      "avmnite-02h",
      "I.I.I.I",
      "run4theh111z",
      "the-hub",
      "w0r1d_d43m0n"
    ]
  },
  cncPort: 5280,
  rmmPort: 5281,
  // Which server is the hacklvl farm
  farmTarget: ["foodnstuff", "n00dles", "sigma-cosmetics", "joesguns", "hong-fang-tea"],
  farmRamPercentage: 0.7,
  farmHost: "home",
  // The prefix for private servers
  prefixPrivate: "pserv-",
  privateServers: {
    maxCount: -2
  },
  // Max ram tier,
  maxRamTier: 20,
  // RAM Manager
  homeRamPercentage: (maxRam) => {
    if (maxRam < 8) {
      return 0;
    }
    if (maxRam < 16) {
      return 0.2;
    }
    if (maxRam < 32) {
      return 0.3;
    }
    if (maxRam < 64) {
      return 0.4;
    }
    return maxRam * 0.5;
  },
  // Prepper
  prep: {},
  // Proto
  proto: {
    greed: 0.5
  },
  hacknet: {
    // The amount of money that should be kept in the player's account
    // as a buffer after doing a purchase
    moneyPercentageBuffer: 0.5
  }
};

// servers/home/batcher/RamManager.ts
var RAMManager = class {
  constructor(ns, servers, log = new Logger(ns)) {
    this.ns = ns;
    this.log = log;
    this.serverBlocks = servers;
    if (this.blocks.length === 0) {
      ns.tprint(Color.red.wrap("No servers with admin rights"));
      ns.exit();
    }
  }
  blocks = [];
  _getServers;
  mapServers(servers) {
    return servers.map((s) => {
      let maxRam = s.maxRam;
      if (s.hostname === "home") {
        maxRam = config.homeRamPercentage(s.maxRam);
      }
      return {
        server: s.hostname,
        ram: maxRam - s.ramUsed,
        maxRam: () => this.getServerMaxRam(s.hostname),
        usedRam: () => this.ns.getServerUsedRam(s.hostname),
        s
      };
    });
  }
  getServerMaxRam(server) {
    let maxRam = this.ns.getServerMaxRam(server);
    if (server === "home") {
      maxRam = config.homeRamPercentage(maxRam);
    }
    return maxRam;
  }
  set getServers(fn) {
    this._getServers = fn;
  }
  set serverBlocks(servers) {
    this.blocks = this.mapServers(servers.filter((s) => s.hasAdminRights));
  }
  reevaluate() {
    if (this._getServers) {
      this.serverBlocks = this._getServers();
    }
    this.blocks = this.blocks.map((server) => {
      server.ram = server.maxRam() - server.usedRam();
      return server;
    });
    return this;
  }
  assign(blockJob) {
    this.log.info(
      `Block Job: ${blockJob.server} ${this.ns.formatRam(blockJob.ramReq)} | Threads: ${blockJob.threads} ThreadSize: ${blockJob.threadSize}`
    );
    this.reevaluate();
    if (blockJob.ramReq > this.totalRam) {
      this.log.warn(`Not enough total RAM to assign block ${this.ns.formatRam(blockJob.ramReq)}`);
      return false;
    }
    const biggestBlock = this.getBiggestBlock();
    if (biggestBlock.ram >= blockJob.ramReq) {
      return this.assignBlockToServer(biggestBlock, blockJob);
    }
    const block = this.blocks.sort((a, b) => b.ram - a.ram).find((b) => b.ram >= blockJob.ramReq);
    if (block)
      return this.assignBlockToServer(block, blockJob);
    const minBlockSize = blockJob.threadSize;
    let numThreads = blockJob.threads;
    let assignedBlock = null;
    let infiniteLoopBreaker = 1e5;
    while (numThreads > 0) {
      this.log.debug("Iteration: %s", 1e5 - infiniteLoopBreaker);
      this.log.debug("Threads left: %s", numThreads);
      if (infiniteLoopBreaker < 0) {
        this.log.error("Infinite loop detected in %s (args: %)", this.ns.getScriptName(), this.ns.args.join(" "));
        return false;
      }
      infiniteLoopBreaker--;
      const nextBlock = this.blocks.sort((a, b) => b.ram - a.ram).find((b) => b.ram >= minBlockSize);
      if (!nextBlock) {
        this.log.warn(`Not enough blocks to assign ${numThreads} threads`);
        return false;
      }
      const threads = Math.min(numThreads, Math.floor(nextBlock.ram / blockJob.threadSize));
      if (threads < 1) {
        this.log.warn(`Not enough ram to assign ${numThreads} threads`);
        return false;
      }
      const block2 = {
        server: nextBlock.server,
        ramReq: threads * blockJob.threadSize,
        threads,
        threadSize: blockJob.threadSize
      };
      assignedBlock = this.assignBlockToServer(nextBlock, block2, assignedBlock);
      numThreads -= threads;
      this.log.info("Threads open: %s", numThreads);
    }
    assignedBlock.jobBlock = blockJob;
    return assignedBlock;
  }
  assignBlockToServer(serverBlock, block, assignedBlock) {
    this.log.info(`Assigning block ${this.ns.formatRam(block.ramReq)} to ${serverBlock.server}`);
    block.server = serverBlock.server;
    serverBlock.ram -= block.ramReq;
    const newAssignedBlock = assignedBlock || {
      jobBlock: block,
      ramBlocks: [],
      threads: 0,
      ramTotal: 0
    };
    newAssignedBlock.ramBlocks.push(block);
    newAssignedBlock.threads += block.threads;
    newAssignedBlock.ramTotal += block.ramReq;
    return newAssignedBlock;
  }
  getBiggestBlock() {
    return this.blocks.sort((a, b) => b.ram - a.ram).find((x) => x !== void 0);
  }
  getSmallestBlock() {
    return this.blocks.reduce((acc, cur) => acc.ram < cur.ram || cur.ram == 0 ? acc : cur);
  }
  getCountBlocksOfSize(size) {
    return this.blocks.filter((b) => b.ram >= size).reduce((acc, cur) => acc + Math.floor(cur.ram / size), 0);
  }
  get all() {
    return this.blocks;
  }
  get totalRam() {
    return Object.values(this.blocks).reduce((acc, cur) => acc + cur.ram, 0);
  }
  toString() {
    return `RAMManager: 
Total Ram: ${this.totalRam}
${JSON.stringify(this.blocks)}`;
  }
};

// servers/home/cnc/lib.ts
function setupDefault(ns, schema) {
  const args = flags(ns, schema);
  setupTail(ns, args);
  return args;
}
function flags(ns, schema) {
  return ns.flags([["tail", false], ...schema || []]);
}
function setupTail(ns, args) {
  if (args.tail) {
    ns.tprintRaw(`Tailing logs`);
    ns.ui.openTail();
  }
}
var pServerPrefix = config.prefixPrivate;
function getServers(ns) {
  const servers = ns.scan();
  for (let i = 0; i < servers.length; i++) {
    const neighbors = ns.scan(servers[i]);
    for (const neighbor of neighbors) {
      if (servers.includes(neighbor))
        continue;
      servers.push(neighbor);
    }
  }
  return servers;
}

// servers/home/lib/bbElements.ts
var doc = eval("document");
var win = eval("window");
var bbRoot = () => doc.querySelector("#root");
var bbTerminalInput = () => doc.querySelector("#terminal-input");
var bbContainer = () => doc.querySelector("#root > div.MuiBox-root.css-1ik4laa");
var bbContentContainer = () => doc.querySelector("#root > div.MuiBox-root.css-1ik4laa > div.MuiBox-root.css-1mojy8p-root");
var bbDrawer = () => bbRoot().querySelector(".MuiDrawer-root .MuiDrawer-paper ul");
var bbNetwork = () => bbDrawer().querySelector("div.MuiCollapse-wrapperInner.MuiCollapse-vertical.css-8atqhb");
var bbPageButtons = () => bbDrawer().querySelectorAll(
  ".MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button"
);
async function main() {
  console.log({ bbRoot: bbRoot() });
  console.log({ bbContainer: bbContainer() });
  console.log({ bbContentContainer: bbContentContainer() });
  console.log({ bbDrawer: bbDrawer() });
  console.log({ bbNetwork: bbNetwork() });
}

// servers/home/server/utils.ts
function getHostname(ns, server) {
  if (typeof server === "string")
    return server;
  return server.hostname;
}

// servers/home/server/sort.ts
var BY_RAM_USAGE = (ns) => (a, b) => ns.getServerUsedRam(getHostname(ns, b)) - ns.getServerUsedRam(getHostname(ns, a));

// servers/home/lib/lock.ts
var Lock = class {
  constructor(ns, target) {
    this.ns = ns;
    this.target = target;
  }
  async lock() {
    while (this.isLocked()) {
      await this.ns.sleep(100);
    }
    this.ns.write(this.lockFile(), JSON.stringify({
      pid: this.ns.pid,
      owner: this.ns.getHostname()
    }, null, 2), "w");
  }
  unlock() {
    this.ns.rm(this.lockFile());
  }
  isLocked() {
    return this.ns.fileExists(this.lockFile());
  }
  lockFile() {
    return `servers/${this.target}.lock.json`;
  }
};

// servers/home/proto-batch.ts
async function main2(ns) {
  const target = ns.args[0];
  const lock = new Lock(ns, target);
  const args = setupDefault(ns);
  ns.clearLog();
  if (lock.isLocked()) {
    ns.exit();
  }
  await lock.lock();
  ns.atExit(() => {
    lock.unlock();
  });
  const proto = new ProtoBatcher(
    ns,
    new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer)),
    new Metrics(ns, 0),
    new Logger(ns),
    config.proto
  );
  await proto.loop(target);
}
export {
  main2 as main
};

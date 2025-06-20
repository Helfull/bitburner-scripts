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
export {
  RAMManager
};

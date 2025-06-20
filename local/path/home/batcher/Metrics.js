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
var MetricError = class extends Error {
  data;
  constructor(message, data) {
    super(message + (data ? `: ${JSON.stringify(data)}` : ""));
    this.name = this.constructor.name;
    this.data = data;
  }
};
var SEC_DEC_WKN = 0.05;
var SEC_INC_HCK = 2e-3;
var SEC_INC_GRW = 4e-3;
var ERROR_MARGIN = 1e-7;
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
export {
  ERROR_MARGIN,
  MetricError,
  Metrics,
  SEC_DEC_WKN,
  SEC_INC_GRW,
  SEC_INC_HCK
};

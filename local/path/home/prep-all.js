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
function weight(ns, server) {
  if (!server)
    return 0;
  if (server.startsWith("hacknet-node"))
    return 0;
  const player = ns.getPlayer();
  const so = ns.getServer(server);
  so.hackDifficulty = so.minDifficulty;
  if ((so.requiredHackingSkill || 0) > player.skills.hacking)
    return 0;
  let weight3 = (so.moneyMax || 0) / (so.minDifficulty || 1);
  if (ns.fileExists("Formulas.exe")) {
    weight3 = (so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
  } else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2)
    return 0;
  return weight3;
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
function ramAvailable(ns, server) {
  return Math.floor(ns.getServerMaxRam(getHostname(ns, server)) - ns.getServerUsedRam(getHostname(ns, server)));
}

// servers/home/server/sort.ts
var BY_WEIGHT = (ns) => (a, b) => weight(ns, getHostname(ns, b)) - weight(ns, getHostname(ns, a));

// servers/home/server/filter.ts
var CAN_HACK = (ns) => (server) => CAN_BE_NUKED(ns)(server) && HAS_ADMIN_ACCESS(ns)(server);
var IS_HACKABLE = CAN_HACK;
var CAN_BE_NUKED = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
var HAS_RAM_AVAILABLE = (ns) => (server) => ns.getServerMaxRam(getHostname(ns, server)) > 0 && ns.getServerUsedRam(getHostname(ns, server)) < ns.getServerMaxRam(getHostname(ns, server));
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var HAS_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var HAS_MAX_MONEY = (ns) => (server) => ns.getServerMoneyAvailable(getHostname(ns, server)) >= ns.getServerMaxMoney(getHostname(ns, server));
var HAS_NOT_MAX_MONEY = (ns) => (server) => !HAS_MAX_MONEY(ns)(server);
var HAS_MIN_SECURITY = (ns) => (server) => ns.getServerSecurityLevel(getHostname(ns, server)) <= ns.getServerMinSecurityLevel(getHostname(ns, server));
var HAS_NOT_MIN_SECURITY = (ns) => (server) => !HAS_MIN_SECURITY(ns)(server);
var HAS_AVAILABLE_RAM = (ns) => (server, ram) => HAS_RAM_AVAILABLE(ns)(server) && ramAvailable(ns, server) > ram;
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);
var IS_HOME = (ns) => (server) => getHostname(ns, server) === "home";
var IS_NOT_HOME = (ns) => (server) => !IS_HOME(ns)(server);
var IS_PREPPED = (ns) => (server) => HAS_MAX_MONEY(ns)(server) && HAS_MIN_SECURITY(ns)(server);
var NEEDS_PREP = (ns) => (server) => HAS_NOT_MAX_MONEY(ns)(server) || HAS_NOT_MIN_SECURITY(ns)(server);

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

// servers/home/prep-all.ts
async function main2(ns) {
  const logger = new Logger(ns, {
    outputFunction: "tprintf"
  });
  function filterPrepped(ns2, targets) {
    logger.info(`Filtering prepped servers`);
    targets.filter(IS_PREPPED(ns2)).forEach((t) => {
      logger.info(`Prepped ${t} starting proto batch`);
      handToProto(ns2, t);
    });
    return targets.filter(NEEDS_PREP(ns2));
  }
  function handToProto(ns2, target) {
    logger.info(`Handing over to proto batcher ${Color.green.wrap(target)}`);
    const pid = ns2.run("proto-batch.js", 1, target);
    if (pid === 0) {
      logger.info(`Failed to run proto-batch.js on ${Color.green.wrap(target)}`);
    }
    logger.info(`PID: ${pid}`);
    return pid;
  }
  const preppingPids = [];
  try {
    const args = setupDefault(ns);
    let targets = getServers(ns).filter(IS_NOT_PRIVATE(ns)).filter(IS_NOT_HOME(ns)).filter(HAS_ADMIN_ACCESS(ns)).filter(HAS_MONEY(ns)).filter(IS_HACKABLE(ns)).sort(BY_WEIGHT(ns));
    ns.ui.setTailTitle(ns.sprintf("Targetting %s", targets.join(", ")));
    while (targets.length > 0) {
      await ns.sleep(100);
      targets = filterPrepped(ns, targets);
      const target = ns.getServer(targets.shift());
      logger.info(`Targetting ${target.hostname}`);
      ns.ui.setTailTitle(ns.sprintf("Targetting %s", target.hostname));
      let runOn = target.hostname;
      if (!HAS_RAM_AVAILABLE(ns)(target.hostname, ns.getScriptRam("prep.js")) || !HAS_ADMIN_ACCESS(ns)(target.hostname)) {
        logger.warn(`Cant run on target ${target.hostname}, searching for script host with ram available, required: ${ns.getScriptRam("prep.js")}`);
        const servers = getServers(ns);
        let potential = [];
        do {
          potential = servers.filter((s) => HAS_ADMIN_ACCESS(ns)(s)).filter((s) => HAS_AVAILABLE_RAM(ns)(s, ns.getScriptRam("prep.js")));
          if (potential.length === 0) {
            await ns.sleep(100);
            logger.warn(`No servers with enough ram to run prep.js`);
          }
          await ns.sleep(1e3);
        } while (potential.length === 0);
        runOn = potential[0];
        logger.info(`Trying to run prep.js on ${runOn} with ${ns.formatRam(ramAvailable(ns, runOn))} available.`);
      }
      logger.info(`Running prep.js on ${runOn} ${ns.formatRam(ns.getServerMaxRam(runOn) - ns.getServerUsedRam(runOn))}`);
      ns.scp("prep.js", runOn, "home");
      ns.scp("batcher/Prepper.js", runOn, "home");
      ns.scp("batcher/RamManager.js", runOn, "home");
      ns.scp("cnc/lib.js", runOn, "home");
      let pid = ns.exec("prep.js", runOn, { threads: 1, preventDuplicates: true, temporary: true }, target.hostname);
      if (pid === 0) {
        logger.error(`Failed to run prep.js on ${runOn}`);
        continue;
      }
      preppingPids.push({ pid, target });
    }
  } catch (e) {
    logger.error(`Error: ${e}`);
  }
  do {
    await ns.share();
    await ns.sleep(1e3);
    for (let prep of preppingPids) {
      if (ns.isRunning(prep.pid))
        continue;
      handToProto(ns, prep.target.hostname);
      await ns.sleep(100);
    }
  } while (preppingPids.some((prep) => ns.isRunning(prep.pid)));
}
export {
  main2 as main
};

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

// servers/home/lib/flags.ts
var defaultFlags = {
  help: {
    description: "Displays this help message, providing detailed information about script usage.",
    defaultValue: false
  },
  win: {
    description: "Opens script logs in a new window, similar to the --tail option for enhanced readability.",
    defaultValue: false
  }
};
function defineScript(ns, definition) {
  const argCountRequired = Object.keys(definition.args ?? {}).length;
  const flags = getFlags(ns, definition.flags);
  setupTail(ns, flags);
  printHelp(ns, flags, definition);
  if (argCountRequired === 0) {
    return flags;
  }
  const args = getArgs(flags["_"] || [], definition.args);
  delete flags["_"];
  if (args.length < argCountRequired) {
    ns.tprintf(Color.red.wrap(`Error: Missing required arguments. Expected: ${argCountRequired}, Provided: ${args.length}`));
    printHelp(ns, { help: true }, definition);
    ns.exit();
  }
  return { args, flags };
}
function setupTail(ns, args) {
  ns.disableLog("ALL");
  if (args.win) {
    ns.ui.openTail();
  }
}
function printHelp(ns, flags, definition) {
  function printSection(ns2, title, content) {
    ns2.tprintf(Color.yellow.wrap(`=== ${title} ===
`));
    ns2.tprintf(content + "\n\n");
  }
  if (flags.help) {
    const scriptName = Color.pink.wrap(ns.getScriptName());
    ns.tprintf(Color.green.wrap(`
********** Help for ${scriptName} **********
`));
    ns.tprintf(
      Color.white.wrap(
        `Welcome to the help section for ${scriptName}. Here's everything you need to know to get started:

`
      )
    );
    const argsText = Object.keys(definition.args ?? {}).map((arg) => `${Color.white.wrap("[")}${Color.red.wrap(arg)}${Color.white.wrap("]")}`).join(", ");
    const flagsText = Object.keys(definition.flags).map((flag) => `(--${Color.red.wrap(flag)})`).join(", ");
    const execCommandText = Color.grey.wrap(
      `${Color.white.wrap(`run ${ns.getScriptName()}`)} ${argsText} ${flagsText}`
    );
    printSection(ns, "Description", definition.description + "\n\n" + execCommandText);
    if (Object.keys(definition.args ?? {}).length > 0) {
      const formatArg = ([key, { description, defaultValue }]) => `  ${Color.red.wrap(key)}: (default: ${Color.grey.wrap(defaultValue)})
    ${description}`;
      const argsHelpText = Object.entries(definition.args).map(formatArg).join("\n");
      printSection(ns, "Args", argsHelpText);
    }
    const formatFlag = ([key, { description, defaultValue }]) => `  ${Color.red.wrap("--" + key)}: (default: ${Color.grey.wrap(defaultValue)})
    ${description}`;
    const customFlagsHelpText = Object.entries(definition.flags).map(formatFlag).join("\n");
    const defaultFlagsHelpText = Object.entries(defaultFlags).map(formatFlag).join("\n");
    printSection(ns, "Flags", customFlagsHelpText);
    printSection(ns, "Global Flags", defaultFlagsHelpText);
    ns.tprintf(Color.white.wrap("For more information, visit the official documentation or reach out on the forums."));
    ns.exit();
  }
}
function getFlags(ns, flagsInput) {
  const combinedFlagsInput = { ...defaultFlags, ...flagsInput };
  const schema = Object.entries(combinedFlagsInput).map(([key, { defaultValue }]) => [
    key,
    defaultValue
  ]);
  const flagsResult = ns.flags(schema);
  return flagsResult;
}
function getArgs(args, definition) {
  if (!definition || Object.keys(definition).length === 0) {
    return {};
  }
  const argsEvaluated = {};
  Object.entries(definition).forEach(([key, argDefinition], index) => {
    if (args[index] === void 0) {
      argsEvaluated[key] = argDefinition.defaultValue ?? null;
      return;
    }
    argsEvaluated[key] = args[index];
  });
  return argsEvaluated;
}

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

// servers/home/tools/servers.ts
async function main(ns) {
  const args = defineScript(ns, {
    description: "Manages private server farm upgrade and purchase",
    flags: {
      upgrade: { description: "Try to upgrade current servers to highest purchaseable tier.", defaultValue: false },
      purchase: {
        description: "Try to purchase the highest purchaseable tier possible for X servers",
        defaultValue: config.privateServers.maxCount
      },
      loop: {
        description: "Loop the whole time until finished, No more servers need upgrades and/or all servers have been bought",
        defaultValue: false
      },
      debug: { description: "Enable debug logging", defaultValue: false },
      cli: { description: "Use CLI output instead of tprintf", defaultValue: false }
    }
  });
  const log = new Logger(ns, {
    outputFunction: args.cli ? "tprintf" : "printf"
  });
  const purchaseServers = args.purchase > 0 || args.purchase === -1;
  const doAll = !args.upgrade && !purchaseServers;
  log.debug("Args: %s", JSON.stringify(args));
  log.debug("Purchase servers: %s", purchaseServers);
  log.debug("Upgrade servers: %s", args.upgrade);
  log.debug("Do all: %s", doAll);
  const manager = new ServerManager(ns, log);
  manager.maxServersLimit = args.purchase;
  manager.doPurchaseServers = doAll || purchaseServers;
  manager.doUpgradeServers = doAll || args.upgrade;
  do {
    const pServers = ns.getPurchasedServers();
    log.log(`Purchased servers: ${pServers.length}`);
    log.log(`Max servers: ${manager.maxServersLimit}`);
    log.debug("finished %s", manager.finished ? "Yes" : "No");
    log.debug("hitServersLimit %s", manager.hitServersLimit ? "Yes" : "No");
    log.debug("serversAreMaxed %s", manager.serversAreMaxed ? "Yes" : "No");
    log.debug("doPurchaseServers %s", manager.doPurchaseServers ? "Yes" : "No");
    log.debug("doUpgradeServers %s", manager.doUpgradeServers ? "Yes" : "No");
    manager.tryUpgradeServers();
    manager.tryPurchaseServer();
    if (args.loop) {
      await ns.sleep(1e3);
    }
    manager.updateServers();
  } while (args.loop && !manager.finished);
  log.info(`Finished managing servers.`);
}
var ServerManager = class {
  constructor(ns, log) {
    this.ns = ns;
    this.log = log;
    this.updateServers();
    this.serversLimit = this.ns.getPurchasedServerLimit();
  }
  servers = [];
  maxedServersCount = 0;
  serversLimit = 0;
  doPurchaseServers = true;
  doUpgradeServers = true;
  get maxServersLimit() {
    return this.serversLimit;
  }
  set maxServersLimit(limit) {
    if (limit === -1 || limit > this.ns.getPurchasedServerLimit()) {
      limit = this.ns.getPurchasedServerLimit();
    }
    this.serversLimit = limit;
  }
  get hitServersLimit() {
    return this.servers.length >= this.serversLimit || this.servers.length >= this.ns.getPurchasedServerLimit();
  }
  get serversAreMaxed() {
    return this.maxedServersCount >= this.servers.length;
  }
  get finished() {
    if (this.doPurchaseServers && !this.hitServersLimit)
      return false;
    if (this.doUpgradeServers && !this.serversAreMaxed)
      return false;
    return true;
  }
  updateServers() {
    this.servers = this.ns.getPurchasedServers();
  }
  tryPurchaseServer() {
    if (this.hitServersLimit)
      return;
    this.log.log("Trying to purchase another server");
    const purchaseableMaxTier = this.getMaxTierPurchaseable();
    this.log.log(
      `Max tier purchaseable: ${purchaseableMaxTier.maxTier} (${this.ns.formatNumber(purchaseableMaxTier.cost)})`
    );
    this.ns.purchaseServer(this.getNextServerName(), Math.pow(2, purchaseableMaxTier.maxTier));
  }
  tryUpgradeServers() {
    if (this.serversAreMaxed)
      return;
    this.maxedServersCount = 0;
    this.log.log("Trying to upgrade servers");
    for (const hostname of this.servers) {
      const server = this.ns.getServer(hostname);
      let curTier = Math.log(server.maxRam) / Math.log(2);
      const nextUpgradeCost = this.ns.getPurchasedServerUpgradeCost(server.hostname, Math.pow(2, curTier + 1));
      if (curTier >= config.maxRamTier) {
        curTier = "MAX";
        this.maxedServersCount++;
      }
      this.log.info(
        `Server: ${server.hostname} (${this.ns.formatRam(server.maxRam)}, ${curTier}, ${this.ns.formatNumber(
          nextUpgradeCost
        )})`
      );
      if (server.maxRam < Math.pow(2, config.maxRamTier)) {
        this.upgradeServer(server);
      }
    }
  }
  getNextServerName() {
    return `${config.prefixPrivate}${this.ns.getPurchasedServers().length + 1}`;
  }
  upgradeServer(server) {
    let maxTier = config.maxRamTier;
    while (server.maxRam < Math.pow(2, maxTier) && maxTier > 1) {
      this.log.info(`Checking upgrade cost for ${server.hostname} to ${Math.pow(2, maxTier)}`);
      const upgradeCost = this.ns.getPurchasedServerUpgradeCost(server.hostname, Math.pow(2, maxTier));
      if (upgradeCost <= this.ns.getServerMoneyAvailable("home")) {
        break;
      }
      maxTier--;
    }
    if (server.maxRam >= Math.pow(2, maxTier) || maxTier < 1)
      return false;
    this.log.info(
      `Upgrading server: ${server.hostname} (${this.ns.formatRam(server.maxRam)} to ${this.ns.formatRam(
        Math.pow(2, maxTier)
      )})`
    );
    return this.ns.upgradePurchasedServer(server.hostname, Math.pow(2, maxTier));
  }
  getMaxTierPurchaseable() {
    let maxTier = 1;
    while (this.ns.getPurchasedServerCost(Math.pow(2, maxTier + 1)) < this.ns.getServerMoneyAvailable("home") && maxTier <= config.maxRamTier) {
      maxTier++;
    }
    return { maxTier, cost: this.ns.getPurchasedServerCost(Math.pow(2, maxTier)) };
  }
};
export {
  main
};

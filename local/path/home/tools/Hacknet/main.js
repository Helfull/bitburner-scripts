// servers/home/tools/Hacknet/Node.ts
var Node = class {
  constructor(hacknet, index, stats) {
    this.hacknet = hacknet;
    this.index = index;
    Object.assign(this, stats);
  }
  get nextRamCost() {
    return this.hacknet.getRamUpgradeCost(this.index);
  }
  get nextCoreCost() {
    return this.hacknet.getCoreUpgradeCost(this.index);
  }
  get nextLevelCost() {
    return this.hacknet.getLevelUpgradeCost(this.index);
  }
};

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

// servers/home/tools/Hacknet/Manager.ts
var Manager = class {
  constructor(ns, log = new Logger(ns)) {
    this.ns = ns;
    this.log = log;
    Object.assign(this, ns.hacknet);
  }
  lastPurchase;
  gatherNodes() {
    return Array.from({ length: this.numNodes() }, (_, i) => new Node(this, i, this.getNodeStats(i)));
  }
  get nodes() {
    return this.gatherNodes();
  }
  run(strategy) {
    const nodes = this.nodes;
    const purchase = strategy(this, nodes);
    if (!this.canAfford(purchase.cost)) {
      return;
    }
    this.lastPurchase = purchase;
    switch (purchase.type) {
      case "node":
        this.purchaseNode();
        break;
      case "level":
        this.upgradeNodeLevels(purchase.node);
        break;
      case "ram":
        this.upgradeNodeRam(purchase.node);
        break;
      case "core":
        this.upgradeNodeCores(purchase.node);
        break;
    }
    this.log.info(`Purchased ${purchase.type} for ${this.ns.formatNumber(purchase.cost)}`);
  }
  canAfford(cost) {
    return this.ns.getServerMoneyAvailable("home") >= cost;
  }
  purchaseNewNode() {
    this.purchaseNode();
  }
  upgradeNodeLevels(node) {
    this.upgradeLevel(node.index);
  }
  upgradeNodeRam(node) {
    this.upgradeRam(node.index);
  }
  upgradeNodeCores(node) {
    this.upgradeCore(node.index);
  }
  toString() {
    const out = [`Manager { nodes: ${this.numNodes()}, maxNodes: ${this.maxNumNodes()} }`];
    for (const node of this.nodes) {
      out.push(`${node.name} - [${this.ns.formatNumber(node.totalProduction)}]`);
      out.push(`  ${node.level} (${Color.grey.wrap(this.ns.formatNumber(node.nextLevelCost))})`);
      out.push(`  ${node.ram}GB (${Color.grey.wrap(this.ns.formatNumber(node.nextRamCost))})`);
      out.push(`  ${node.cores} (${Color.grey.wrap(this.ns.formatNumber(node.nextCoreCost))})`);
    }
    return out.join("\n");
  }
};

// servers/home/tools/Hacknet/Strategy/LowestCost.ts
function CheapestBuy(hacknet, nodes) {
  const nextNodePurchase = hacknet.getPurchaseNodeCost();
  let cheapestOption = { type: "node", cost: nextNodePurchase };
  for (const node of nodes) {
    if (cheapestOption.cost > node.nextLevelCost) {
      cheapestOption = { type: "level", node, cost: node.nextLevelCost };
    }
    if (cheapestOption.cost > node.nextRamCost) {
      cheapestOption = { type: "ram", node, cost: node.nextRamCost };
    }
    if (cheapestOption.cost > node.nextCoreCost) {
      cheapestOption = { type: "core", node, cost: node.nextCoreCost };
    }
  }
  return cheapestOption;
}

// servers/home/tools/Hacknet/main.ts
function main(ns) {
  const manager = new Manager(ns);
  manager.run(CheapestBuy);
}
export {
  main
};

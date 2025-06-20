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

// servers/home/tools/hacknet.ts
async function main(ns) {
  const args = setupDefault(ns);
  const hackNet = ns.hacknet;
  ns.print(`Max nodes: ${hackNet.maxNumNodes()}`);
  ns.print(`Nodes: ${hackNet.numNodes()}`);
  while (true) {
    ns.print(`Money: ${ns.formatNumber(getPlayerMoneyAvailable(ns))}`);
    const purchase = findCheapestPurchase(ns);
    if (purchase === null || purchase.cost > getPlayerMoneyAvailable(ns)) {
      ns.clearLog();
      ns.print("No purchase available");
      await ns.sleep(1e3);
      continue;
    }
    ns.print(`Purchasing ${purchase.type} for node ${purchase.index} for a cost of ${ns.formatNumber(purchase.cost)}`);
    switch (purchase.type) {
      case "node":
        purchaseNode(ns);
        break;
      case "level":
        upgradeNodeLevels(ns, purchase.index);
        break;
      case "ram":
        upgradeNodeRam(ns, purchase.index);
        break;
      case "core":
        upgradeNodeCores(ns, purchase.index);
        break;
    }
    await ns.sleep(5);
  }
}
function purchaseCondition(ns, nodeIndex, cost) {
  if (ns.hacknet.getNodeStats(nodeIndex).totalProduction < cost) {
    return false;
  }
  if (getPlayerMoneyAvailable(ns) < cost) {
    return false;
  }
  return true;
}
function purchaseNode(ns) {
  const hackNet = ns.hacknet;
  if (hackNet.maxNumNodes() <= hackNet.numNodes())
    return;
  if (getPlayerMoneyAvailable(ns) < hackNet.getPurchaseNodeCost())
    return;
  ns.print("Purchasing node");
  hackNet.purchaseNode();
}
function upgradeNodeLevels(ns, nodeIndex) {
  const hackNet = ns.hacknet;
  if (!purchaseCondition(ns, nodeIndex, hackNet.getLevelUpgradeCost(nodeIndex)))
    return;
  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} from ${node.level} to ${node.level + 1}`);
  hackNet.upgradeLevel(nodeIndex);
}
function upgradeNodeRam(ns, nodeIndex) {
  const hackNet = ns.hacknet;
  if (!purchaseCondition(ns, nodeIndex, hackNet.getRamUpgradeCost(nodeIndex)))
    return;
  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} ram from ${node.ram} to ${node.ram + 1}`);
  hackNet.upgradeRam(nodeIndex);
}
function upgradeNodeCores(ns, nodeIndex) {
  const hackNet = ns.hacknet;
  if (!purchaseCondition(ns, nodeIndex, hackNet.getCoreUpgradeCost(nodeIndex)))
    return;
  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} cores from ${node.cores} to ${node.cores + 1}`);
  hackNet.upgradeCore(nodeIndex);
}
var moneyBuffer = 0;
function getPlayerMoneyAvailable(ns) {
  const playerMoney = ns.getPlayer().money;
  if (moneyBuffer === 0) {
    moneyBuffer = playerMoney - playerMoney * config.hacknet.moneyPercentageBuffer;
  }
  return ns.getPlayer().money - moneyBuffer;
}
function findCheapestPurchase(ns) {
  const hackNet = ns.hacknet;
  let purchase = null;
  if (hackNet.maxNumNodes() > hackNet.numNodes()) {
    purchase = {
      type: "node",
      index: -1,
      cost: hackNet.getPurchaseNodeCost()
    };
  }
  for (let i = 0; i < hackNet.numNodes(); i++) {
    if (purchase.cost > hackNet.getLevelUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: "level",
        index: i,
        cost: hackNet.getLevelUpgradeCost(i)
      };
    }
    if (purchase.cost > hackNet.getRamUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: "ram",
        index: i,
        cost: hackNet.getRamUpgradeCost(i)
      };
    }
    if (purchase.cost > hackNet.getCoreUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: "core",
        index: i,
        cost: hackNet.getCoreUpgradeCost(i)
      };
    }
  }
  return purchase;
}
export {
  main
};

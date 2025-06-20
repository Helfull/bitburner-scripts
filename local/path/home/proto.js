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

// servers/home/server/sort.ts
var BY_WEIGHT = (ns) => (a, b) => weight(ns, getHostname(ns, b)) - weight(ns, getHostname(ns, a));

// servers/home/server/filter.ts
var CAN_HACK = (ns) => (server) => CAN_BE_NUKED(ns)(server) && HAS_ADMIN_ACCESS(ns)(server);
var CAN_HAVE_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var CAN_BE_NUKED = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);

// servers/home/proto.ts
async function main2(ns) {
  const args = setupDefault(ns);
  const targets = getServers(ns).filter(IS_NOT_PRIVATE(ns)).filter(CAN_HACK(ns)).filter(CAN_HAVE_MONEY(ns)).sort(BY_WEIGHT(ns)).slice(0, config.proto.attackTop);
  ns.tprint(JSON.stringify(targets, null, 2));
  ns.ui.setTailTitle(ns.sprintf("Targetting %s", targets.join(", ")));
  for (const target of targets) {
    ns.tprint(`Targetting ${target}`);
    ns.run("cnc/proto-batch.js", 1, target, ...ns.args);
  }
}
export {
  main2 as main
};

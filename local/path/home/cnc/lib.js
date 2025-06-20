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
function killOldScript(ns, scriptName, server) {
  if (!ns.scriptRunning(scriptName, server)) {
    return;
  }
  const script = ns.getRunningScript(scriptName, server);
  if (script === null) {
    return;
  }
  if (script.pid !== ns.pid) {
    ns.tprint(`Script already running`);
    ns.tprint(`PID: ${script.pid}`);
    ns.tprint(`Threads: ${script.threads}`);
    ns.tprint(`Killing old script`);
    ns.kill(script.pid);
  }
}
function bool(bool2) {
  return bool2 ? Color.green.wrap("Yes") : Color.red.wrap("No");
}
function boolBG(bool2) {
  return bool2 ? Color.greenBG.black.wrap("Yes") : Color.redBG.white.wrap(" No");
}
function progressBar(ns, current, max, percent, options = { width: 20, text: false }) {
  options.width = options.width || 20;
  options.text = options.text ?? false;
  options.formatter = options.formatter || ns.formatNumber;
  options.reverse = options.reverse || false;
  percent = percent !== void 0 ? percent : current / max;
  if (isNaN(percent))
    percent = 0;
  const fillColor = options.reverse ? "red" : "green";
  const emptyColor = options.reverse ? "green" : "red";
  let barWidth = Math.floor(options.width * Math.min(1, percent));
  const leftBar = Color[fillColor].wrap(["\uEE04".repeat(Math.max(0, barWidth))].join(""));
  const rightBar = Color[emptyColor].wrap(["\uEE01".repeat(Math.max(0, options.width - barWidth))].join(""));
  const startCap = percent > 0 ? Color[fillColor].wrap("\uEE03") : Color[emptyColor].wrap("\uEE00");
  const endCap = percent >= 1 ? Color[fillColor].wrap("\uEE05") : Color[emptyColor].wrap("\uEE02");
  const bar = `${startCap}${leftBar}${rightBar}${endCap}`;
  if (options.text === false)
    return `${bar}`;
  return `${options.formatter(current || 0)}/${options.formatter(max || 0)} (${ns.sprintf(
    "%.2f%%",
    percent * 100
  )}) ${bar}`;
}
function stripColors(str) {
  return Color.unwrap(str);
}
var pServerPrefix = config.prefixPrivate;
function settingsArg(ns) {
  return JSON.parse(ns.args[1].replace("'", '"'));
}
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
  let weight2 = (so.moneyMax || 0) / (so.minDifficulty || 1);
  if (ns.fileExists("Formulas.exe")) {
    weight2 = (so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
  } else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2)
    return 0;
  return weight2;
}
export {
  bool,
  boolBG,
  flags,
  getServers,
  killOldScript,
  pServerPrefix,
  progressBar,
  settingsArg,
  setupDefault,
  setupTail,
  stripColors,
  weight
};

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
function stripColors(str) {
  return Color.unwrap(str);
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
  let weight2 = (so.moneyMax || 0) / (so.minDifficulty || 1);
  if (ns.fileExists("Formulas.exe")) {
    weight2 = (so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
  } else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2)
    return 0;
  return weight2;
}

// servers/home/lib/table.ts
var tableConfig = {
  // Should there be padding between divider and content
  padding: 1,
  // The characters used to draw the table
  divider: {
    vertical: "\u2503",
    horizontal: "\u2500",
    cross: "\u2542",
    middle: {
      left: "\u2520",
      right: "\u2528",
      top: "\u2530",
      bottom: "\u2538"
    },
    corner: {
      topLeft: "\u250E",
      topRight: "\u2512",
      bottomLeft: "\u2516",
      bottomRight: "\u251A"
    }
  }
};
function printTableObj(ns, tableRows, output = ns.tprint) {
  if (tableRows.length === 0)
    return;
  const table = {};
  for (const row of tableRows) {
    for (const key in row) {
      if (!table[key])
        table[key] = [];
      table[key].push(row[key]);
    }
  }
  printTable(ns, table, output);
}
function printTable(ns, table, output = ns.tprint) {
  let strip = (v) => v;
  if (typeof stripColors === "function") {
    strip = stripColors;
  }
  const header = Object.keys(table);
  const cols = Object.values(table).map((col) => col.map((v) => v?.toString() || ""));
  const rows = cols[0].map((_, i) => cols.map((col) => col[i]));
  const colWidths = header.map((columnHeader, i) => {
    const header2 = strip(columnHeader);
    const headerWidth = header2.length;
    const rowsStr = rows.map((row) => strip(row[i] || ""));
    const colsWidth = rowsStr.map((row) => row.length);
    const result = Math.max(headerWidth, ...colsWidth || []);
    return result;
  });
  const makeCell = (cellValue, i) => {
    return "".padStart(colWidths[i] - strip(cellValue || "").length + tableConfig.padding, " ") + (cellValue || "") + "".padEnd(tableConfig.padding, " ");
  };
  const padding = tableConfig.padding;
  const dividerVertical = tableConfig.divider.vertical;
  const dividerHorizontal = tableConfig.divider.horizontal;
  const dividerCross = tableConfig.divider.cross;
  const cornerTopLeft = tableConfig.divider.corner.topLeft;
  const cornerTopRight = tableConfig.divider.corner.topRight;
  const cornerBottomLeft = tableConfig.divider.corner.bottomLeft;
  const cornerBottomRight = tableConfig.divider.corner.bottomRight;
  const middleLeft = tableConfig.divider.middle.left;
  const middleRight = tableConfig.divider.middle.right;
  const middleTop = tableConfig.divider.middle.top;
  const middleBottom = tableConfig.divider.middle.bottom;
  debugger;
  output(
    [
      "",
      // Top border
      cornerTopLeft + header.map((_, i) => "".padStart(colWidths[i] + padding * 2, dividerHorizontal).padEnd(padding, dividerHorizontal)).join(middleTop) + cornerTopRight,
      // Headers
      dividerVertical + header.map((v, i) => makeCell(v, i)).join(dividerVertical) + dividerVertical,
      // Middle border
      middleLeft + header.map((_, i) => "".padStart(colWidths[i] + padding * 2, dividerHorizontal).padEnd(padding, dividerHorizontal)).join(dividerCross) + middleRight,
      // Rows
      rows.map((row) => dividerVertical + row.map((v, i) => makeCell(v, i)).join(dividerVertical) + dividerVertical).join("\n"),
      // Bottom border
      cornerBottomLeft + header.map((_, i) => "".padStart(colWidths[i] + padding * 2, dividerHorizontal)).join(middleBottom) + cornerBottomRight
    ].join("\n")
  );
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

// servers/home/server/filter.ts
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var HAS_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var HAS_MAX_MONEY = (ns) => (server) => ns.getServerMoneyAvailable(getHostname(ns, server)) >= ns.getServerMaxMoney(getHostname(ns, server));
var HAS_NOT_MAX_MONEY = (ns) => (server) => !HAS_MAX_MONEY(ns)(server);
var HAS_MIN_SECURITY = (ns) => (server) => ns.getServerSecurityLevel(getHostname(ns, server)) <= ns.getServerMinSecurityLevel(getHostname(ns, server));
var HAS_NOT_MIN_SECURITY = (ns) => (server) => !HAS_MIN_SECURITY(ns)(server);
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);
var IS_HOME = (ns) => (server) => getHostname(ns, server) === "home";
var IS_NOT_HOME = (ns) => (server) => !IS_HOME(ns)(server);
var IS_PREPPED = (ns) => (server) => HAS_MAX_MONEY(ns)(server) && HAS_MIN_SECURITY(ns)(server);
var NEEDS_PREP = (ns) => (server) => HAS_NOT_MAX_MONEY(ns)(server) || HAS_NOT_MIN_SECURITY(ns)(server);

// servers/home/server/sort.ts
var BY_WEIGHT = (ns) => (a, b) => weight(ns, getHostname(ns, b)) - weight(ns, getHostname(ns, a));

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

// servers/home/batcher/ProtoManager.ts
var ProtoManager = class {
  constructor(ns, log = new Logger(ns)) {
    this.ns = ns;
    this.log = log;
  }
  async loop() {
    const protoPids = [];
    const prepPids = [];
    while (true) {
      const targets = getServers(this.ns).filter(IS_NOT_HOME(this.ns)).filter(IS_NOT_PRIVATE(this.ns)).filter(HAS_MONEY(this.ns)).filter(HAS_ADMIN_ACCESS(this.ns));
      targets.filter(NEEDS_PREP(this.ns)).sort(BY_WEIGHT(this.ns)).filter((target) => !prepPids.some((p) => p.server === target)).forEach((server) => {
        this.log.info(`Prepping ${server}`);
        const pid = this.ns.run("prep.js", 1, server);
        if (pid === 0) {
          this.log.error(`Failed to start prep on ${server}`);
          return;
        }
        prepPids.push({ server, pid });
      });
      const protoTargets = targets.filter(IS_PREPPED(this.ns)).sort(BY_WEIGHT(this.ns)).slice(0, 10);
      for (const pid of protoPids) {
        if (!protoTargets.includes(pid.server)) {
          this.log.info(`Killing proto on ${pid.server}`);
          const killed = this.ns.kill(pid.pid);
          if (!killed)
            this.log.error(`Failed to kill proto on ${pid.server}`);
          protoPids.splice(protoPids.indexOf(pid), 1);
        }
      }
      protoTargets.forEach((server) => {
        if (protoPids.some((p) => p.server === server)) {
          this.log.info(`Already protoing ${server}`);
          return;
        }
        this.log.info(`Protoing ${server}`);
        const pid = this.ns.run("proto-batch.js", 1, server);
        if (pid === 0) {
          this.log.error(`Failed to start proto on ${server}`);
          return;
        }
        protoPids.push({ server, pid });
      });
      console.log(protoPids);
      printTableObj(this.ns, protoPids, this.ns.print);
      await this.ns.sleep(1e3);
    }
  }
};
async function main2(ns) {
  setupDefault(ns);
  const proto = new ProtoManager(ns);
  await proto.loop();
}
export {
  ProtoManager,
  main2 as main
};

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

// servers/home/tools/purchaseProgram.ts
function checkVirus(ns, virus) {
  if (!ns.fileExists(virus, "home")) {
    return false;
  }
  return true;
}

// servers/home/cnc/nuke.ts
async function tryPurchaseVirus(ns, virus) {
  const pid = ns.run("tools/purchaseProgram.js", 1, "--viruses", virus);
  while (ns.isRunning(pid)) {
    await ns.sleep(100);
  }
  return checkVirus(ns, virus);
}
async function nuke(ns, server) {
  await ftpPortOpen(ns, server);
  await sqlPortOpen(ns, server);
  await httpPortOpen(ns, server);
  await sshPortOpen(ns, server);
  await smtpPortOpen(ns, server);
  if (!server.hasAdminRights) {
    if ((server.numOpenPortsRequired ?? 0) > (server.openPortCount ?? 0)) {
      return false;
    }
    try {
      ns.nuke(server.hostname);
    } catch (e) {
      return false;
    }
  }
  return true;
}
async function ftpPortOpen(ns, server) {
  if (!server.ftpPortOpen && await tryPurchaseVirus(ns, "FTPCrack.exe")) {
    ns.ftpcrack(server.hostname);
  }
}
async function sqlPortOpen(ns, server) {
  if (!server.sqlPortOpen && await tryPurchaseVirus(ns, "SQLInject.exe")) {
    ns.sqlinject(server.hostname);
  }
}
async function httpPortOpen(ns, server) {
  if (!server.httpPortOpen && await tryPurchaseVirus(ns, "HTTPWorm.exe")) {
    ns.httpworm(server.hostname);
  }
}
async function sshPortOpen(ns, server) {
  if (!server.sshPortOpen && await tryPurchaseVirus(ns, "BruteSSH.exe")) {
    ns.brutessh(server.hostname);
  }
}
async function smtpPortOpen(ns, server) {
  if (!server.smtpPortOpen && await tryPurchaseVirus(ns, "relaySMTP.exe")) {
    ns.relaysmtp(server.hostname);
  }
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
var HAS_MAX_PORTS = (ns, maxPorts) => (server) => ns.getServerNumPortsRequired(getHostname(ns, server)) <= maxPorts;
var CAN_BE_NUKED = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var HAS_NO_ADMIN_ACCESS = (ns) => (server) => !HAS_ADMIN_ACCESS(ns)(server);

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

// servers/home/nuke-net.ts
async function main2(ns) {
  setupDefault(ns);
  killOldScript(ns, ns.getScriptName(), ns.getServer().hostname);
  const serverCache = [];
  const stats = {
    virus: {
      "BruteSSH.exe": await tryPurchaseVirus(ns, "BruteSSH.exe"),
      "FTPCrack.exe": await tryPurchaseVirus(ns, "FTPCrack.exe"),
      "relaySMTP.exe": await tryPurchaseVirus(ns, "relaySMTP.exe"),
      "HTTPWorm.exe": await tryPurchaseVirus(ns, "HTTPWorm.exe"),
      "SQLInject.exe": await tryPurchaseVirus(ns, "SQLInject.exe")
    }
  };
  ns.ui.setTailTitle("Nuke Net");
  ns.ui.resizeTail(715, 320);
  ns.ui.moveTail(1010, 0);
  while (true) {
    const viruses = Object.keys(stats.virus);
    for (const virus of viruses) {
      if (!stats.virus[virus]) {
        stats.virus[virus] = await tryPurchaseVirus(ns, virus);
      }
    }
    ns.clearLog();
    ns.print(
      Object.keys(stats.virus).map(
        (v) => stats.virus[v] ? Color.bold.black.greenBG.wrap(" " + v + " ") : Color.bold.white.redBG.wrap(" " + v + " ")
      ).join("")
    );
    const canCrack = viruses.filter((v) => stats.virus[v]).length;
    const targets = getServers(ns).map((s) => ns.getServer(s)).filter(HAS_NO_ADMIN_ACCESS(ns)).filter(HAS_MAX_PORTS(ns, canCrack)).filter(CAN_BE_NUKED(ns)).sort(BY_WEIGHT(ns));
    if (targets.length > 0) {
      ns.ui.resizeTail(715, 320);
      printTableObj(
        ns,
        targets.map((s) => ({
          name: s.hostname,
          openPorts: s.openPortCount,
          requiredPorts: s.numOpenPortsRequired,
          requireHackSkill: s.requiredHackingSkill
        })),
        ns.printf
      );
    } else {
      ns.ui.resizeTail(715, 60);
    }
    for (const server of targets) {
      if (await nuke(ns, server)) {
        serverCache.push(server.hostname);
      }
    }
    await ns.share();
  }
}
export {
  main2 as main
};

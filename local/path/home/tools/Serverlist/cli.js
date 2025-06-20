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
function bool(bool2) {
  return bool2 ? Color.green.wrap("Yes") : Color.red.wrap("No");
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
var CAN_HACK = (ns) => (server) => CAN_BE_NUKED(ns)(server) && HAS_ADMIN_ACCESS(ns)(server);
var IS_HACKABLE = CAN_HACK;
var CAN_BE_NUKED = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var HAS_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);
var IS_HOME = (ns) => (server) => getHostname(ns, server) === "home";
var IS_NOT_HOME = (ns) => (server) => !IS_HOME(ns)(server);

// servers/home/server/sort.ts
var BY_RAM_USAGE = (ns) => (a, b) => ns.getServerUsedRam(getHostname(ns, b)) - ns.getServerUsedRam(getHostname(ns, a));
var BY_WEIGHT = (ns) => (a, b) => weight(ns, getHostname(ns, b)) - weight(ns, getHostname(ns, a));
var BY_HACKABLE = (ns) => (a, b) => ns.getServerRequiredHackingLevel(getHostname(ns, a)) - ns.getServerRequiredHackingLevel(getHostname(ns, b));
var BY_MAX_RAM = (ns) => (a, b) => b.maxRam - a.maxRam;

// servers/home/tools/Serverlist/Serverlist.ts
var FILTERS_MAP = {
  hackable: IS_HACKABLE,
  money: HAS_MONEY,
  nothome: IS_NOT_HOME,
  notprivate: IS_NOT_PRIVATE
};
var FILTERS = Object.keys(FILTERS_MAP);
var SORTS_MAP = {
  ram: BY_RAM_USAGE,
  maxRam: BY_MAX_RAM,
  weight: BY_WEIGHT,
  hackable: BY_HACKABLE
};
var SORTS = Object.keys(SORTS_MAP);
var Tuple = (xs) => xs;
var COLUMNS = Tuple([
  "index",
  "status",
  "name",
  "money",
  "maxRam",
  "usedRam",
  "usedRamPercent",
  "secLevel",
  "rootAccess",
  "backdoorInstalled",
  "hackable",
  "hackSkill",
  "hackTime",
  "wknTime",
  "growTime",
  "weight",
  "protoStatus",
  "prepStatus"
]);
function percentField(min, max) {
  return () => ({ current: min, max, percent: min / max || 0 });
}
function serverList(ns, args) {
  args = {
    sort: ["weight"],
    columns: [...COLUMNS],
    filter: ["hackable", "money", "nothome", "notprivate"],
    servers: [],
    markup: false,
    ...args
  };
  const servers = getServers(ns);
  const total = {
    maxRam: 0,
    usedRam: 0,
    minSecLevel: 0,
    secLevel: 0,
    curMoney: 0,
    maxMoney: 0
  };
  let serversTable = servers.map((server) => ns.getServer(server));
  if (args.servers.filter((server) => server.length > 0).length > 0) {
    serversTable = serversTable.filter((server) => {
      for (const filter of args.servers) {
        if (server.hostname.includes(filter)) {
          return true;
        }
      }
      return false;
    });
  }
  for (const filter of args.filter) {
    if (FILTERS_MAP[filter]) {
      serversTable = serversTable.filter(FILTERS_MAP[filter](ns));
    }
  }
  for (const sort of args.sort) {
    if (SORTS_MAP[sort]) {
      serversTable = serversTable.sort(SORTS_MAP[sort](ns));
    }
  }
  const mappedServerTable = serversTable.map((server, i) => {
    total.maxRam += server.maxRam;
    total.usedRam += server.ramUsed;
    total.secLevel += server.hackDifficulty;
    total.minSecLevel += server.minDifficulty;
    total.curMoney += server.moneyAvailable;
    total.maxMoney += server.moneyMax;
    const protoStatus = () => ns.getRunningScript("proto-batch.js", "home", server.hostname) !== null;
    const prepStatus = () => ns.getRunningScript("prep.js", "home", server.hostname) !== null;
    const data = {
      index: () => i.toString(),
      status: () => {
        const isMaxedMoney = server.moneyAvailable === server.moneyMax;
        const isMinSecLevel = server.hackDifficulty === server.minDifficulty;
        const isPrepped = isMaxedMoney && isMinSecLevel;
        const isRunningProto = protoStatus();
        const isRunningPrep = prepStatus();
        let status = "UNKNOWN";
        if (isPrepped && !isRunningProto) {
          status = "READY";
        }
        if (isMaxedMoney && isMinSecLevel && isRunningProto) {
          status = "OKAY";
        }
        if (!isPrepped && !isRunningPrep) {
          status = "WARN";
        }
        if (!isPrepped && isRunningProto) {
          status = "ERROR";
        }
        if (isRunningPrep) {
          status = "PREP";
        }
        return status;
      },
      weight: () => ns.formatNumber(weight(ns, server.hostname)),
      name: () => server.hostname,
      money: percentField(server.moneyAvailable, server.moneyMax),
      maxRam: () => ns.formatRam(server.maxRam, 0),
      usedRam: () => ns.formatRam(server.ramUsed),
      usedRamPercent: percentField(server.ramUsed, server.maxRam),
      secLevel: percentField(server.hackDifficulty, server.minDifficulty),
      rootAccess: () => server.hasAdminRights,
      backdoorInstalled: () => server.backdoorInstalled || false,
      hackable: () => (server.requiredHackingSkill || 0) <= ns.getHackingLevel(),
      hackSkill: () => ns.sprintf("%d", server.requiredHackingSkill || 0),
      hackTime: () => ns.formatNumber(ns.getHackTime(server.hostname) / 1e3, 0),
      wknTime: () => ns.formatNumber(ns.getWeakenTime(server.hostname) / 1e3, 0),
      growTime: () => ns.formatNumber(ns.getGrowTime(server.hostname) / 1e3, 0),
      protoStatus,
      prepStatus
    };
    return {
      data,
      server: server.hostname
    };
  });
  mappedServerTable.unshift({
    server: "Total",
    data: {
      ...args.columns.reduce((acc, col) => ({ ...acc, [col]: () => "" }), {}),
      name: () => "Total",
      maxRam: () => ns.formatRam(total.maxRam, 0),
      usedRam: () => ns.formatRam(total.usedRam),
      usedRamPercent: percentField(total.usedRam, total.maxRam),
      secLevel: percentField(total.minSecLevel, total.secLevel),
      money: percentField(total.curMoney, total.maxMoney)
    }
  });
  return {
    args,
    rows: mappedServerTable.map((row) => ({
      server: row.server,
      data: args.columns.reduce((acc, col) => {
        acc[col] = row.data[col]();
        return acc;
      }, {})
    }))
  };
}

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

// servers/home/tools/Serverlist/cli.ts
var cliFormatMap = {
  money: (value, _, __, ns) => progressBar(ns, value.current, value.max),
  usedRamPercent: (value, _, __, ns) => progressBar(ns, value.current, value.max),
  secLevel: (value, _, __, ns) => progressBar(ns, value.max, value.current, Math.abs(1 - value.percent), { text: true, reverse: true }),
  rootAccess: (value) => bool(value),
  protoStatus: (value) => bool(value),
  prepStatus: (value) => bool(value),
  backdoorInstalled: (value) => bool(value),
  hackable: (value) => bool(value),
  status: (value) => ({
    READY: Color.white.greenBG.wrap(value),
    OKAY: Color.white.greenBG.wrap(value),
    WARN: Color.white.yellowBG.wrap(value),
    ERROR: Color.white.redBG.wrap(value),
    UNKNOWN: value
  })[value],
  default: (value) => value === void 0 ? "" : value
};
async function main2(ns) {
  const args = defineScript(ns, {
    description: "List all servers",
    flags: {
      sort: {
        description: "Sort servers by",
        defaultValue: ["ram", "weight", "hackable"],
        options: SORTS
      },
      columns: {
        description: "Columns to display",
        defaultValue: COLUMNS,
        options: COLUMNS
      },
      filter: {
        description: "Filter servers",
        defaultValue: [],
        options: FILTERS
      },
      servers: {
        description: "Servers to display",
        defaultValue: []
      },
      refresh: {
        description: "Refresh the list",
        defaultValue: false,
        options: []
      },
      refreshrate: {
        description: "Refresh rate in ms",
        defaultValue: 1e4,
        options: []
      }
    }
  });
  ns.ui.moveTail(60, 0);
  do {
    ns.clearLog();
    const mappedServerTable = serverList(ns, {
      sort: args.sort,
      filter: args.filter,
      servers: args.servers,
      markup: true
    });
    const mappedRows = mappedServerTable.rows.map((row) => {
      return args.columns.reduce((acc, col) => {
        const field = cliFormatMap[col] || cliFormatMap.default;
        acc[col] = field(row.data[col], col, row.server, ns);
        return acc;
      }, {});
    });
    printTableObj(ns, mappedRows, ns.tprint);
  } while (args.refresh && await ns.sleep(args.refreshrate));
}
export {
  main2 as main
};

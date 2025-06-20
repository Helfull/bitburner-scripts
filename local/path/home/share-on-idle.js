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
var HAS_RAM_AVAILABLE = (ns) => (server) => ns.getServerMaxRam(getHostname(ns, server)) > 0 && ns.getServerUsedRam(getHostname(ns, server)) < ns.getServerMaxRam(getHostname(ns, server));
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);
var IS_HOME = (ns) => (server) => getHostname(ns, server) === "home";
var IS_NOT_HOME = (ns) => (server) => !IS_HOME(ns)(server);

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

// servers/home/share-on-idle.ts
async function main2(ns) {
  const script = defineScript(ns, {
    description: "Share on idle servers",
    flags: {},
    args: {}
  });
  while (true) {
    const servers = getServers(ns).filter((s) => IS_NOT_HOME(ns)(s)).filter((s) => s !== "pserv-1").filter((s) => HAS_ADMIN_ACCESS(ns)(s)).filter((s) => HAS_RAM_AVAILABLE(ns)(s));
    printTableObj(ns, servers.map((s) => ({
      name: s,
      maxRam: ns.getServerMaxRam(s),
      usedRam: ns.getServerUsedRam(s),
      hasRam: HAS_RAM_AVAILABLE(ns)(s),
      hasAdmin: HAS_ADMIN_ACCESS(ns)(s),
      isPrivate: IS_NOT_PRIVATE(ns)(s)
    })), ns.printf);
    const shareOnPids = servers.map((target) => {
      let availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
      const threads = Math.floor(availableRam / ns.getScriptRam("share.js"));
      if (threads > 0) {
        ns.scp("share.js", target, "home");
        return ns.exec(
          "share.js",
          target,
          Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam("share.js"))
        );
      }
      return 0;
    }).filter(Boolean);
    while (shareOnPids.some((pid) => ns.isRunning(pid))) {
      ns.clearLog();
      printTableObj(ns, servers.map((s) => ({
        name: s,
        maxRam: ns.getServerMaxRam(s),
        usedRam: ns.getServerUsedRam(s),
        hasRam: HAS_RAM_AVAILABLE(ns)(s),
        hasAdmin: HAS_ADMIN_ACCESS(ns)(s),
        isPrivate: IS_NOT_PRIVATE(ns)(s)
      })), ns.printf);
      ns.printf(`Waiting for share.js to finish on ${shareOnPids.length} servers. [${shareOnPids.join(", ")}]`);
      await ns.sleep(1e3);
    }
    await ns.sleep(100);
  }
}
export {
  main2 as main
};

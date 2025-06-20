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

// servers/home/hack-net.ts
async function main(ns) {
  killOldScript(ns, ns.getScriptName(), ns.getServer().hostname);
  const args = defineScript(ns, {
    description: "Manage hacknet nodes",
    flags: {
      loop: {
        description: "Run in a loop",
        defaultValue: false
      },
      delay: {
        description: "The delay between runs",
        defaultValue: 1e3
      }
    }
  });
  const manager = new Manager(ns);
  const headerlevel = `level [${Color.grey.wrap("next cost")}]`;
  const headerram = `ram [${Color.grey.wrap("next cost")}]`;
  const headercores = `cores [${Color.grey.wrap("next cost")}]`;
  do {
    manager.run(CheapestBuy);
    const nodes = manager.nodes.map((node) => ({
      id: node.index,
      name: node.name,
      [headerlevel]: node.level + ` [${Color.grey.wrap(ns.formatNumber(node.nextLevelCost))}]`,
      [headerram]: node.ram + `.00 GB [${Color.grey.wrap(ns.formatNumber(node.nextRamCost))}]`,
      [headercores]: node.cores + ` [${Color.grey.wrap(ns.formatNumber(node.nextCoreCost))}]`,
      "production / sec": Color.yellow.wrap(ns.formatNumber(node.production)),
      totalProduction: Color.yellow.wrap(ns.formatNumber(node.totalProduction))
    }));
    ns.clearLog();
    printTableObj(ns, nodes, ns.printf);
    if (!manager.lastPurchase) {
      ns.print("No purchase done");
      await ns.sleep(1e3);
      continue;
    }
    ns.printf(
      `Last purchase: ${manager.lastPurchase.type} for ${ns.formatNumber(manager.lastPurchase.cost)} Node: ${manager.lastPurchase.node?.name}`
    );
    await ns.sleep(args.delay);
  } while (args.loop);
}
export {
  main
};

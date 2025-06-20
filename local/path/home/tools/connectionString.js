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

// servers/home/lib/serverTree.ts
var Server = class {
  name;
  parent;
  children;
  constructor(name, parent = null, children = []) {
    this.name = name;
    this.parent = parent;
    this.children = children;
  }
  get allChildren() {
    return this.children.flatMap((child) => [child.name, ...child.allChildren]);
  }
  find(name) {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const found = child.find(name);
      if (found) {
        return found;
      }
    }
    return null;
  }
  reversePathTo(name) {
    const path = [];
    let current = this.find(name);
    while (current) {
      path.unshift(current.name);
      current = this.find(current.parent);
    }
    return path;
  }
};
function createServerTree(ns, filters) {
  const root = newServer("home");
  const servers = filters(ns.scan(root.name));
  root.children = servers.map((server) => {
    return parseServer(ns, server, root);
  });
  return root;
}
function parseServer(ns, serverName, parent) {
  const server = newServer(serverName, parent.name);
  const children = ns.scan(server.name).filter((child) => child !== server.name && child !== parent.name);
  server.children = children.map((child) => parseServer(ns, child, server));
  return server;
}
function newServer(name, parent = null, children = []) {
  return new Server(name, parent, children);
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
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);

// servers/home/tools/connectionString.ts
async function main2(ns) {
  const script = defineScript(ns, {
    description: "Test script",
    flags: {},
    args: {
      target: {
        description: "Target server to reverse path to",
        defaultValue: "run4theh111z"
      }
    }
  });
  const tree = createServerTree(ns, (servers) => servers.filter(IS_NOT_PRIVATE(ns)));
  ns.tprint(tree.reversePathTo(script.args.target).reduce((prev, cur) => prev + " ;connect " + cur, ""));
}
export {
  main2 as main
};

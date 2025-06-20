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

// servers/home/tools/purchaseProgram.ts
function checkVirus(ns, virus) {
  if (!ns.fileExists(virus, "home")) {
    return false;
  }
  return true;
}
function tryPurchaseVirus(ns, virus) {
  if (checkVirus(ns, virus))
    return true;
  try {
    ns.singularity.purchaseProgram(virus);
    return true;
  } catch (e) {
    if (e.includes("This singularity function requires Source-File 4 to run")) {
      ns.printf(`ERROR | Cannot purchase ${virus} because Source-File 4 is required.`);
      return false;
    }
    return false;
  }
}
async function main(ns) {
  const args = defineScript(ns, {
    description: "Manages private server farm upgrade and purchase",
    flags: {
      viruses: {
        description: "Try to upgrade current servers to highest purchaseable tier.",
        defaultValue: [
          "BruteSSH.exe",
          "FTPCrack.exe",
          "relaySMTP.exe",
          "HTTPWorm.exe",
          "SQLInject.exe",
          "DeepscanV1.exe",
          "DeepscanV2.exe",
          "AutoLink.exe"
        ],
        options: []
      }
    }
  });
  const logger = new Logger(ns);
  logger.info(`Starting virus purchase script with viruses: ${args.viruses.join(", ")}`);
  for (const virus of args.viruses) {
    logger.info(`Checking and trying to purchase virus: ${virus}`);
    const purchased = tryPurchaseVirus(ns, virus);
    if (purchased) {
      logger.success(`Successfully purchased virus: ${virus}`);
    } else {
      logger.error(`Failed to purchase virus: ${virus}`);
    }
  }
}
export {
  checkVirus,
  main,
  tryPurchaseVirus
};

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
export {
  ftpPortOpen,
  httpPortOpen,
  nuke,
  smtpPortOpen,
  sqlPortOpen,
  sshPortOpen,
  tryPurchaseVirus
};

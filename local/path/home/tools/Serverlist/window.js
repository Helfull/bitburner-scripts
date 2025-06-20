var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// react:react
var require_react = __commonJS({
  "react:react"(exports, module) {
    module.exports = window.React;
  }
});

// react:react-dom
var require_react_dom = __commonJS({
  "react:react-dom"(exports, module) {
    module.exports = window.ReactDOM;
  }
});

// servers/home/tools/Serverlist/ServerListUI.tsx
var import_react11 = __toESM(require_react());

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

// servers/home/lib/ui/MultiSelect.tsx
var import_react5 = __toESM(require_react());

// servers/home/lib/ui/Collapsable.tsx
var import_react3 = __toESM(require_react());

// servers/home/lib/MountingPoint.tsx
var import_react = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var import_react2 = __toESM(require_react());
var NetscriptContext = (0, import_react2.createContext)(null);
var CleanupContext = (0, import_react2.createContext)(null);
var TerminateContext = (0, import_react2.createContext)(null);
function ContextCollection({ contexts, children }) {
  return contexts.reduce(
    (previousContextElement, { context: { Provider: CurrentContext }, value }) => /* @__PURE__ */ import_react.default.createElement(CurrentContext, { value }, previousContextElement),
    children
  );
}
var createMountingPoint = (ns, mpConfig = { closeOnExit: true }) => {
  const cleanupCallbacks = [];
  return {
    addCleanup: (f) => cleanupCallbacks.push(f),
    cleanup: () => {
      cleanupCallbacks.forEach((f) => f());
    },
    async mount(component, root) {
      return new Promise(async (resolve) => {
        if (!root) {
          ns.clearLog();
          ns.tail();
          ns.disableLog("ALL");
          ns.printRaw(/* @__PURE__ */ import_react.default.createElement("span", { "data-pid": ns.pid }));
          await ns.sleep(0);
          root = doc.querySelector(`span[data-pid="${ns.pid}"]`);
          if (!root) {
            ns.print("Failed to find root element");
            resolve();
          }
          if (mpConfig.closeOnExit) {
            cleanupCallbacks.push(() => {
              ns.ui.closeTail();
            });
          }
        }
        const contexts = [
          {
            context: NetscriptContext,
            value: ns
          },
          {
            context: TerminateContext,
            value: resolve
          },
          {
            context: CleanupContext,
            value: (f) => cleanupCallbacks.push(f)
          }
        ];
        cleanupCallbacks.push(() => import_react_dom.default.unmountComponentAtNode(root));
        console.log({ root, pid: ns.pid });
        try {
          import_react_dom.default.render(
            /* @__PURE__ */ import_react.default.createElement(ContextCollection, { contexts }, component),
            root
          );
        } catch (e) {
          console.warn(e);
          resolve();
        }
        watchForElementRemoval(root, () => {
          resolve();
        });
      });
    }
  };
};
function watchForElementRemoval(element, callback) {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          if (!containsRecursive(node, element))
            return;
          callback();
          observer.disconnect();
        });
      }
    });
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  return {
    cleanup: () => observer.disconnect()
  };
}
function containsRecursive(container, child) {
  if (!("children" in container))
    return false;
  return [...container.children].reduce((prev, cur) => prev || cur == child || containsRecursive(cur, child), false);
}

// servers/home/lib/ui/Collapsable.tsx
function Collapsable({ title, children, style }) {
  const [show, setShow] = (0, import_react3.useState)(false);
  const ns = (0, import_react3.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("div", { onClick: () => setShow(!show), style: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
    border: "1px solid black",
    backgroundColor: ns.ui.getTheme().backgroundsecondary,
    padding: "8px",
    boxSizing: "border-box"
  } }, /* @__PURE__ */ import_react3.default.createElement("span", null, title), /* @__PURE__ */ import_react3.default.createElement("span", null, show ? "\u2BC6" : "\u2BC8")), /* @__PURE__ */ import_react3.default.createElement("div", { style: {
    paddingLeft: "16px",
    ...style,
    display: show ? style?.display || "block" : "none",
    width: "100%",
    boxSizing: "border-box"
  } }, children));
}

// servers/home/lib/ui/Checkbox.tsx
var import_react4 = __toESM(require_react());
var Checkbox = ({ name, label, isChecked, onChange }) => /* @__PURE__ */ import_react4.default.createElement("label", { htmlFor: name, onClick: () => onChange(!isChecked) }, /* @__PURE__ */ import_react4.default.createElement("input", { type: "checkbox", key: name, name, checked: isChecked, onChange: (e) => onChange(e.target.checked) }), label);

// servers/home/lib/ui/MultiSelect.tsx
function MultiSelect({ options, value, onselect }) {
  const ns = (0, import_react5.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react5.default.createElement("div", { style: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid black",
    backgroundColor: ns.ui.getTheme().backgroundsecondary
  } }, options.map((option) => /* @__PURE__ */ import_react5.default.createElement("div", { style: {
    padding: "8px"
  }, key: option }, /* @__PURE__ */ import_react5.default.createElement(Checkbox, { name: option, label: option, isChecked: value.includes(option), onChange: (checked) => {
    onselect(options.filter((v) => checked && v === option || value.includes(v) && v !== option));
  } }))));
}
function CollapsableMultiSelect({ title, options, value, onselect }) {
  return /* @__PURE__ */ import_react5.default.createElement("div", { style: { width: "100%" } }, /* @__PURE__ */ import_react5.default.createElement(Collapsable, { style: {
    maxHeight: "300px",
    overflow: "auto"
  }, title }, /* @__PURE__ */ import_react5.default.createElement(MultiSelect, { options, value, onselect })));
}

// servers/home/tools/Serverlist/ui/Serverlist.tsx
var import_react10 = __toESM(require_react());

// servers/home/lib/ui/ProgressBar.tsx
var import_react6 = __toESM(require_react());
function ProgressBar({ percent, max, current, reverseColors = false }) {
  const ns = (0, import_react6.useContext)(NetscriptContext);
  if (isNaN(percent) || isNaN(max) || isNaN(current)) {
    return /* @__PURE__ */ import_react6.default.createElement("div", null, "Invalid progress bar values");
  }
  const emptyColor = reverseColors ? "rgba(0, 255, 0, .5)" : "rgba(255, 0, 0, .5)";
  const fillColor = reverseColors ? "rgba(255, 0, 0, .5)" : "rgba(0, 255, 0, .5)";
  return /* @__PURE__ */ import_react6.default.createElement("div", { style: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "8px"
  } }, /* @__PURE__ */ import_react6.default.createElement("div", { style: {
    position: "absolute",
    display: "flex",
    height: "8px",
    width: "100%",
    bottom: 0
  } }, /* @__PURE__ */ import_react6.default.createElement("div", { style: { backgroundColor: fillColor, width: ns.formatPercent(percent), height: "100%" } }), /* @__PURE__ */ import_react6.default.createElement("div", { style: { backgroundColor: emptyColor, width: ns.formatPercent(1 - percent), height: "100%" } })), /* @__PURE__ */ import_react6.default.createElement("span", null, ns.formatNumber(current)), /* @__PURE__ */ import_react6.default.createElement("span", null, "/"), /* @__PURE__ */ import_react6.default.createElement("span", null, ns.formatNumber(max)), /* @__PURE__ */ import_react6.default.createElement("span", null, "(", ns.formatPercent(percent), ")"));
}

// servers/home/lib/ui/BooleanBox.tsx
var import_react7 = __toESM(require_react());
function BooleanBox({ children, value }) {
  const ns = (0, import_react7.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react7.default.createElement("div", { style: {
    backgroundColor: value ? "rgba(0, 255, 0, .5)" : "rgba(255, 0, 0, .5)",
    textAlign: "center"
  } }, children);
}

// servers/home/lib/ui/RunWrapper.tsx
var import_react8 = __toESM(require_react());
function RunWrapper({
  children,
  script
}) {
  const ns = (0, import_react8.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react8.default.createElement("div", { style: { cursor: "pointer" }, onClick: () => {
    const pid = ns.exec(script.scriptName, script.host, typeof script.threadOptions === "number" ? script.threadOptions : {
      ...script.threadOptions,
      preventDuplicates: true
    }, ...script.args);
    if (pid === 0) {
      ns.alert("Failed to run " + script.scriptName + " on " + script.host + " with args " + script.args.join(", "));
    }
  } }, children);
}

// servers/home/tools/Serverlist/ui/StatusButtons.tsx
var import_react9 = __toESM(require_react());
function ProtoStatus({ server, value }) {
  return /* @__PURE__ */ import_react9.default.createElement(RunWrapper, { script: {
    scriptName: "proto-batch.js",
    args: [server],
    host: "home"
  } }, /* @__PURE__ */ import_react9.default.createElement(BooleanField, { value }));
}
function PrepStatus({ server, value }) {
  return /* @__PURE__ */ import_react9.default.createElement(RunWrapper, { script: {
    scriptName: "prep.js",
    args: [server],
    host: "home"
  } }, /* @__PURE__ */ import_react9.default.createElement(BooleanField, { value }));
}

// servers/home/tools/Serverlist/ui/Serverlist.tsx
var FieldWrapper = ({ key, children, style }) => /* @__PURE__ */ import_react10.default.createElement("td", { key, style }, /* @__PURE__ */ import_react10.default.createElement("div", { style: { padding: "8px" } }, children));
var BooleanField = ({ value, trueValue = true }) => /* @__PURE__ */ import_react10.default.createElement(BooleanBox, { value: value === trueValue }, value === trueValue ? "Running" : "Stopped");
var statusColorMap = {
  "ERROR": "rgb(128, 0, 0)",
  "WARN": "rgb(128, 128, 0)",
  "OKAY": "rgb(0, 128, 0)",
  "READY": "rgb(0, 128, 128)",
  "PREP": "rgb(0, 0, 128)",
  "UNKNOWN": "rgb(128, 0, 128)"
};
var StatusField = ({ value }) => {
  const status = Color.unwrap(value);
  const backgroundColor = statusColorMap[status] || "white";
  return /* @__PURE__ */ import_react10.default.createElement("div", { style: { padding: "8px", textAlign: "center", backgroundColor } }, status);
};
var getFieldComponent = (col, row) => {
  const fieldComponent = fieldMap[col];
  const value = row.data[col];
  const style = row.server === "Total" ? {
    borderBottom: "solid white 5px",
    position: "sticky",
    left: 0,
    zIndex: 1
  } : {};
  if (value === void 0)
    return /* @__PURE__ */ import_react10.default.createElement(FieldWrapper, { style, key: col }, fieldMap.default(value, col));
  if (fieldComponent === void 0) {
    return /* @__PURE__ */ import_react10.default.createElement(FieldWrapper, { style, key: col }, fieldMap.default(value, col));
  }
  return /* @__PURE__ */ import_react10.default.createElement(FieldWrapper, { style, key: col }, fieldComponent(value, row.server));
};
var fieldMap = {
  protoStatus: (value, serverName) => /* @__PURE__ */ import_react10.default.createElement(ProtoStatus, { value, server: serverName }),
  prepStatus: (value, serverName) => /* @__PURE__ */ import_react10.default.createElement(PrepStatus, { value, server: serverName }),
  rootAccess: (value) => /* @__PURE__ */ import_react10.default.createElement(BooleanField, { value }),
  backdoorInstalled: (value) => /* @__PURE__ */ import_react10.default.createElement(BooleanField, { value }),
  secLevel: (value) => /* @__PURE__ */ import_react10.default.createElement("div", { style: { color: Math.abs(1 - value.percent) > 0 ? "orange" : "white" } }, /* @__PURE__ */ import_react10.default.createElement(ProgressBar, { reverseColors: true, percent: Math.abs(1 - value.percent), max: value.max, current: value.current })),
  money: (value) => /* @__PURE__ */ import_react10.default.createElement("div", { style: { color: value.percent >= 1 ? "white" : "orange" } }, /* @__PURE__ */ import_react10.default.createElement(ProgressBar, { percent: value.percent, max: value.max, current: value.current })),
  usedRamPercent: (value) => /* @__PURE__ */ import_react10.default.createElement("div", { style: { color: value.percent > 0 ? "orange" : "white" } }, /* @__PURE__ */ import_react10.default.createElement(ProgressBar, { percent: value.percent, max: value.max, current: value.current })),
  status: (value) => /* @__PURE__ */ import_react10.default.createElement(StatusField, { value }),
  default: (value, col) => {
    if (value === void 0)
      return col;
    try {
      return Color.unwrap(value);
    } catch (e) {
      console.error(e);
      console.warn("Could not unwrap color", value, col);
      return value;
    }
  }
};
function ServerList({ serverListState }) {
  const ns = (0, import_react10.useContext)(NetscriptContext);
  const header = Object.keys(serverListState.rows[0].data || {});
  const totalRow = serverListState.rows.shift();
  return /* @__PURE__ */ import_react10.default.createElement("div", { style: {
    color: "white",
    fontFamily: ns.ui.getStyles().fontFamily,
    display: "block",
    height: "100%",
    overflow: "auto"
  } }, /* @__PURE__ */ import_react10.default.createElement("table", { style: { width: "100%", borderCollapse: "separate" } }, /* @__PURE__ */ import_react10.default.createElement("thead", { style: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: ns.ui.getTheme().backgroundprimary,
    border: "solid 1px",
    borderColor: ns.ui.getTheme().backgroundsecondary,
    textAlign: "right"
  } }, /* @__PURE__ */ import_react10.default.createElement("tr", null, header.map((col) => /* @__PURE__ */ import_react10.default.createElement("th", { key: col }, /* @__PURE__ */ import_react10.default.createElement("div", { style: { padding: "16px" } }, col)))), /* @__PURE__ */ import_react10.default.createElement("tr", null, header.map((col) => getFieldComponent(col, totalRow)))), serverListState.rows.map((row, i) => /* @__PURE__ */ import_react10.default.createElement("tr", { style: {
    textAlign: "right",
    ...i % 2 ? {
      backgroundColor: ns.ui.getTheme().backgroundprimary
    } : {
      backgroundColor: ns.ui.getTheme().backgroundsecondary
    }
  }, key: i }, header.map((col) => getFieldComponent(col, row))))));
}

// servers/home/tools/Serverlist/ServerListUI.tsx
function storeSettings(settings) {
  localStorage.setItem("serverlist-settings", JSON.stringify(settings));
}
function loadSettings() {
  const settings = localStorage.getItem("serverlist-settings");
  if (settings === null)
    return {
      columns: [
        "index",
        "name",
        "money",
        "secLevel",
        "rootAccess",
        "protoStatus",
        "prepStatus",
        "weight"
      ],
      sort: ["weight"],
      filter: ["money"]
    };
  return JSON.parse(settings);
}
function useSettings() {
  const [settings, setSettings] = (0, import_react11.useState)(loadSettings());
  const setSettingsAndStore = (newSettings) => {
    storeSettings(newSettings);
    setSettings(newSettings);
  };
  return [
    settings,
    (columns) => {
      setSettingsAndStore({ ...settings, columns });
    },
    (sort) => {
      setSettingsAndStore({ ...settings, sort });
    },
    (filter) => {
      setSettingsAndStore({ ...settings, filter });
    },
    setSettingsAndStore
  ];
}
function ServerlistUI() {
  const ns = (0, import_react11.useContext)(NetscriptContext);
  const [debug, setDebug] = (0, import_react11.useState)(false);
  const [settings, setSelectedColumns, setSelectedSorts, setSelectedFilters, setSettings] = useSettings();
  const updateServerlist = () => {
    return serverList(ns, settings);
  };
  const [serverListState, setServerlistState] = (0, import_react11.useState)(() => updateServerlist());
  const [searchValue, setSearchValue] = (0, import_react11.useState)("");
  const searchHandler = (e) => {
    setSearchValue(e.target.value);
    setSettings({ ...settings, servers: e.target.value.split(" ") });
  };
  (0, import_react11.useEffect)(() => {
    const intervalHandle = setInterval(() => {
      setServerlistState(() => updateServerlist());
    }, 100);
    return () => clearInterval(intervalHandle);
  }, [settings]);
  const styles = ns.ui.getStyles();
  const theme = ns.ui.getTheme();
  return /* @__PURE__ */ import_react11.default.createElement("div", { id: "serverlist-app", style: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "100%"
  } }, /* @__PURE__ */ import_react11.default.createElement("div", { style: {
    color: "white",
    fontFamily: styles.fontFamily,
    padding: "8px",
    backgroundColor: theme.backgroundprimary,
    display: "flex",
    gap: "8px",
    flexDirection: "column"
  } }, /* @__PURE__ */ import_react11.default.createElement(Collapsable, { title: "Settings", style: {
    paddingTop: "8px",
    display: "flex",
    gap: "8px",
    flexDirection: "column"
  } }, /* @__PURE__ */ import_react11.default.createElement(Checkbox, { name: "DebugMode", label: "Debug", isChecked: debug, onChange: (checked) => setDebug(checked) }), /* @__PURE__ */ import_react11.default.createElement("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: "16px"
  } }, /* @__PURE__ */ import_react11.default.createElement(CollapsableMultiSelect, { title: "Sort", options: SORTS, value: settings.sort, onselect: (v) => setSelectedSorts(v) }), /* @__PURE__ */ import_react11.default.createElement(CollapsableMultiSelect, { title: "Filter", options: FILTERS, value: settings.filter, onselect: (v) => setSelectedFilters(v) }), /* @__PURE__ */ import_react11.default.createElement(CollapsableMultiSelect, { title: "Columns", options: COLUMNS, value: settings.columns, onselect: (v) => setSelectedColumns(v) }))), /* @__PURE__ */ import_react11.default.createElement("input", { type: "text", name: "serverSearch", placeholder: "Search", style: {
    padding: "8px",
    backgroundColor: theme.backgroundsecondary,
    color: "white",
    fontFamily: styles.fontFamily,
    boxSizing: "border-box",
    border: "none",
    width: "100%",
    outline: "none"
  }, onChange: searchHandler, value: searchValue })), /* @__PURE__ */ import_react11.default.createElement("div", { style: {
    display: debug ? "block" : "none",
    backgroundColor: theme.backgroundsecondary
  } }, JSON.stringify(serverListState.args)), serverListState.rows.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", null, "Loading..."), serverListState.rows.length > 0 && /* @__PURE__ */ import_react11.default.createElement(ServerList, { serverListState }));
}

// servers/home/tools/Serverlist/window.tsx
var import_react12 = __toESM(require_react());
async function main2(ns) {
  const windowApp = createMountingPoint(ns);
  ns.ui.setTailTitle("Serverlist");
  ns.atExit(() => windowApp.cleanup());
  return windowApp.mount(/* @__PURE__ */ import_react12.default.createElement(ServerlistUI, null));
}
export {
  main2 as main
};

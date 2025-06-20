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

// servers/home/tools/Serverlist/ui/Serverlist.tsx
var import_react7 = __toESM(require_react());

// servers/home/lib/MountingPoint.tsx
var import_react = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var import_react2 = __toESM(require_react());

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

// servers/home/lib/MountingPoint.tsx
var NetscriptContext = (0, import_react2.createContext)(null);
var CleanupContext = (0, import_react2.createContext)(null);
var TerminateContext = (0, import_react2.createContext)(null);

// servers/home/lib/ui/ProgressBar.tsx
var import_react3 = __toESM(require_react());
function ProgressBar({ percent, max, current, reverseColors = false }) {
  const ns = (0, import_react3.useContext)(NetscriptContext);
  if (isNaN(percent) || isNaN(max) || isNaN(current)) {
    return /* @__PURE__ */ import_react3.default.createElement("div", null, "Invalid progress bar values");
  }
  const emptyColor = reverseColors ? "rgba(0, 255, 0, .5)" : "rgba(255, 0, 0, .5)";
  const fillColor = reverseColors ? "rgba(255, 0, 0, .5)" : "rgba(0, 255, 0, .5)";
  return /* @__PURE__ */ import_react3.default.createElement("div", { style: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "8px"
  } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: {
    position: "absolute",
    display: "flex",
    height: "8px",
    width: "100%",
    bottom: 0
  } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { backgroundColor: fillColor, width: ns.formatPercent(percent), height: "100%" } }), /* @__PURE__ */ import_react3.default.createElement("div", { style: { backgroundColor: emptyColor, width: ns.formatPercent(1 - percent), height: "100%" } })), /* @__PURE__ */ import_react3.default.createElement("span", null, ns.formatNumber(current)), /* @__PURE__ */ import_react3.default.createElement("span", null, "/"), /* @__PURE__ */ import_react3.default.createElement("span", null, ns.formatNumber(max)), /* @__PURE__ */ import_react3.default.createElement("span", null, "(", ns.formatPercent(percent), ")"));
}

// servers/home/lib/ui/BooleanBox.tsx
var import_react4 = __toESM(require_react());
function BooleanBox({ children, value }) {
  const ns = (0, import_react4.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react4.default.createElement("div", { style: {
    backgroundColor: value ? "rgba(0, 255, 0, .5)" : "rgba(255, 0, 0, .5)",
    textAlign: "center"
  } }, children);
}

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

// servers/home/lib/ui/RunWrapper.tsx
var import_react5 = __toESM(require_react());
function RunWrapper({
  children,
  script
}) {
  const ns = (0, import_react5.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react5.default.createElement("div", { style: { cursor: "pointer" }, onClick: () => {
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
var import_react6 = __toESM(require_react());
function ProtoStatus({ server, value }) {
  return /* @__PURE__ */ import_react6.default.createElement(RunWrapper, { script: {
    scriptName: "proto-batch.js",
    args: [server],
    host: "home"
  } }, /* @__PURE__ */ import_react6.default.createElement(BooleanField, { value }));
}
function PrepStatus({ server, value }) {
  return /* @__PURE__ */ import_react6.default.createElement(RunWrapper, { script: {
    scriptName: "prep.js",
    args: [server],
    host: "home"
  } }, /* @__PURE__ */ import_react6.default.createElement(BooleanField, { value }));
}

// servers/home/tools/Serverlist/ui/Serverlist.tsx
var FieldWrapper = ({ key, children, style }) => /* @__PURE__ */ import_react7.default.createElement("td", { key, style }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { padding: "8px" } }, children));
var BooleanField = ({ value, trueValue = true }) => /* @__PURE__ */ import_react7.default.createElement(BooleanBox, { value: value === trueValue }, value === trueValue ? "Running" : "Stopped");
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
  return /* @__PURE__ */ import_react7.default.createElement("div", { style: { padding: "8px", textAlign: "center", backgroundColor } }, status);
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
    return /* @__PURE__ */ import_react7.default.createElement(FieldWrapper, { style, key: col }, fieldMap.default(value, col));
  if (fieldComponent === void 0) {
    return /* @__PURE__ */ import_react7.default.createElement(FieldWrapper, { style, key: col }, fieldMap.default(value, col));
  }
  return /* @__PURE__ */ import_react7.default.createElement(FieldWrapper, { style, key: col }, fieldComponent(value, row.server));
};
var fieldMap = {
  protoStatus: (value, serverName) => /* @__PURE__ */ import_react7.default.createElement(ProtoStatus, { value, server: serverName }),
  prepStatus: (value, serverName) => /* @__PURE__ */ import_react7.default.createElement(PrepStatus, { value, server: serverName }),
  rootAccess: (value) => /* @__PURE__ */ import_react7.default.createElement(BooleanField, { value }),
  backdoorInstalled: (value) => /* @__PURE__ */ import_react7.default.createElement(BooleanField, { value }),
  secLevel: (value) => /* @__PURE__ */ import_react7.default.createElement("div", { style: { color: Math.abs(1 - value.percent) > 0 ? "orange" : "white" } }, /* @__PURE__ */ import_react7.default.createElement(ProgressBar, { reverseColors: true, percent: Math.abs(1 - value.percent), max: value.max, current: value.current })),
  money: (value) => /* @__PURE__ */ import_react7.default.createElement("div", { style: { color: value.percent >= 1 ? "white" : "orange" } }, /* @__PURE__ */ import_react7.default.createElement(ProgressBar, { percent: value.percent, max: value.max, current: value.current })),
  usedRamPercent: (value) => /* @__PURE__ */ import_react7.default.createElement("div", { style: { color: value.percent > 0 ? "orange" : "white" } }, /* @__PURE__ */ import_react7.default.createElement(ProgressBar, { percent: value.percent, max: value.max, current: value.current })),
  status: (value) => /* @__PURE__ */ import_react7.default.createElement(StatusField, { value }),
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
  const ns = (0, import_react7.useContext)(NetscriptContext);
  const header = Object.keys(serverListState.rows[0].data || {});
  const totalRow = serverListState.rows.shift();
  return /* @__PURE__ */ import_react7.default.createElement("div", { style: {
    color: "white",
    fontFamily: ns.ui.getStyles().fontFamily,
    display: "block",
    height: "100%",
    overflow: "auto"
  } }, /* @__PURE__ */ import_react7.default.createElement("table", { style: { width: "100%", borderCollapse: "separate" } }, /* @__PURE__ */ import_react7.default.createElement("thead", { style: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: ns.ui.getTheme().backgroundprimary,
    border: "solid 1px",
    borderColor: ns.ui.getTheme().backgroundsecondary,
    textAlign: "right"
  } }, /* @__PURE__ */ import_react7.default.createElement("tr", null, header.map((col) => /* @__PURE__ */ import_react7.default.createElement("th", { key: col }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { padding: "16px" } }, col)))), /* @__PURE__ */ import_react7.default.createElement("tr", null, header.map((col) => getFieldComponent(col, totalRow)))), serverListState.rows.map((row, i) => /* @__PURE__ */ import_react7.default.createElement("tr", { style: {
    textAlign: "right",
    ...i % 2 ? {
      backgroundColor: ns.ui.getTheme().backgroundprimary
    } : {
      backgroundColor: ns.ui.getTheme().backgroundsecondary
    }
  }, key: i }, header.map((col) => getFieldComponent(col, row))))));
}
export {
  BooleanField,
  ServerList
};

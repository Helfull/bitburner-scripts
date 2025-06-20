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

// servers/home/tools/ui/Stats.tsx
var import_react4 = __toESM(require_react());

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

// servers/home/lib/hooks/TimerHook.ts
var import_react3 = __toESM(require_react());
function useInterval(callback, delay = 100, watch = []) {
  (0, import_react3.useEffect)(() => {
    const intervalHandle = setInterval(() => {
      callback();
    }, delay);
    return () => clearInterval(intervalHandle);
  }, watch);
}

// servers/home/tools/ui/Stats.tsx
function Stats() {
  const ns = (0, import_react4.useContext)(NetscriptContext);
  const [playerStats, setPlayerStats] = (0, import_react4.useState)({
    money: 0,
    numPeopleKilled: 0,
    entropy: 0,
    totalPlaytime: 0
  });
  useInterval(() => {
    const player = ns.getPlayer();
    setPlayerStats({
      money: player.money,
      numPeopleKilled: player.numPeopleKilled,
      entropy: player.entropy,
      totalPlaytime: player.totalPlaytime
    });
  }, 1e3);
  return /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("h2", null, "Player Stats"), /* @__PURE__ */ import_react4.default.createElement("ul", null, /* @__PURE__ */ import_react4.default.createElement("li", null, "Money: ", ns.formatNumber(playerStats.money), "$"), /* @__PURE__ */ import_react4.default.createElement("li", null, "People Killed: ", playerStats.numPeopleKilled), /* @__PURE__ */ import_react4.default.createElement("li", null, "Entropy: ", playerStats.entropy.toFixed(2)), /* @__PURE__ */ import_react4.default.createElement("li", null, "Total Playtime: ", ns.tFormat(playerStats.totalPlaytime))));
}
export {
  Stats
};

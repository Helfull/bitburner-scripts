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

// servers/home/cnc/ui.tsx
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

// servers/home/cnc/messages/factory.ts
function MessageFactory(ns, messageString) {
  try {
    const msgData = JSON.parse(messageString);
    const message = {
      type: msgData.type,
      host: msgData.host,
      target: msgData.target,
      pid: msgData.pid
    };
    let result = "";
    switch (msgData.type) {
      case "grow":
        result = ns.formatPercent(msgData.result - 1);
        break;
      case "hack":
        result = ns.formatNumber(msgData.result);
        break;
      case "weaken":
        result = ns.formatPercent(msgData.result);
        break;
      case "delay":
        result = ns.formatNumber(msgData.delay);
        break;
      default:
        result = JSON.stringify(msgData);
    }
    message.printMsg = ns.sprintf("%s %s", msgData.job?.args?.batchId || "N/A", result);
    return message;
  } catch (e) {
    ns.tprint(`Error parsing message: ${JSON.stringify(messageString)}`);
    ns.tprint(`Error: ${e}`);
    return {
      type: "unknown",
      printMsg: JSON.stringify(messageString)
    };
  }
}

// servers/home/cnc/scripts.ts
function isRunningByName(ns, scriptName, host) {
  const script = ns.ps(host).find((p) => p.filename === scriptName);
  return script ? script.pid : null;
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

// servers/home/lib/hooks/WindowHelper.ts
var import_react4 = __toESM(require_react());
function useWindow(appNodeId) {
  const [width, setWidth] = (0, import_react4.useState)(0);
  const [height, setHeight] = (0, import_react4.useState)(0);
  const [collapsed, setCollapsed] = (0, import_react4.useState)(false);
  (0, import_react4.useEffect)(() => {
    const collapseObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          if (mutation.attributeName === "title") {
            const collapseButton2 = mutation.target;
            if (collapseButton2.title === "Collapse") {
              setCollapsed(false);
            } else {
              setCollapsed(true);
            }
          }
        }
      }
    });
    const resizeObserver = new ResizeObserver((event) => {
      setWidth(event[0].contentBoxSize[0].inlineSize);
      setHeight(event[0].contentBoxSize[0].blockSize);
    });
    const systemStatusEl = doc.querySelector(appNodeId);
    const parentWindow = systemStatusEl.closest('div[tabindex="-1"]');
    const resizeContainer = systemStatusEl.closest(".react-resizable");
    const collapseButton = resizeContainer.querySelector(
      '.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-c9uei6-titleButton[title="Collapse"]'
    );
    collapseObserver.observe(collapseButton, { attributeFilter: ["title"], attributes: true });
    resizeObserver.observe(parentWindow);
    return () => resizeObserver.disconnect();
  }, []);
  (0, import_react4.useEffect)(() => {
    const systemStatusEl = doc.querySelector(appNodeId);
    const parentWindow = systemStatusEl.closest('div[tabindex="-1"]');
    if (!collapsed) {
      parentWindow.style.display = "block";
      systemStatusEl.style.height = `calc(${height}px - 16px)`;
      systemStatusEl.style.maxHeight = `calc(${height}px - 16px)`;
    } else {
      parentWindow.style.display = "none";
    }
  }, [width, height, collapsed]);
  return { width, height, collapsed };
}

// servers/home/lib/ui/BooleanBox.tsx
var import_react5 = __toESM(require_react());
function BooleanBox({ children, value }) {
  const ns = (0, import_react5.useContext)(NetscriptContext);
  return /* @__PURE__ */ import_react5.default.createElement("div", { style: {
    backgroundColor: value ? "rgba(0, 255, 0, .5)" : "rgba(255, 0, 0, .5)",
    textAlign: "center"
  } }, children);
}

// servers/home/cnc/ui/SystemStatus.tsx
var import_react6 = __toESM(require_react());
function StatusCell({ active, name, pid }) {
  return /* @__PURE__ */ import_react6.default.createElement(BooleanBox, { value: active }, /* @__PURE__ */ import_react6.default.createElement("div", { style: {
    padding: "5px",
    display: "flex",
    gap: "5px",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box"
  } }, /* @__PURE__ */ import_react6.default.createElement("span", null, name), pid ? /* @__PURE__ */ import_react6.default.createElement("span", { style: {
    color: "white",
    fontSize: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "2px 2px 0 2px",
    boxSizing: "border-box"
  } }, pid) : null));
}
function MessageLog({ messages }) {
  return /* @__PURE__ */ import_react6.default.createElement("div", { style: {
    height: "100%",
    overflow: "scroll",
    border: "1px solid white",
    display: "flex",
    flexDirection: "column",
    padding: "5px",
    boxSizing: "border-box"
  } }, messages.slice(0, 20).map((message, index) => /* @__PURE__ */ import_react6.default.createElement("div", { style: { borderBottom: "1px solid white" }, key: index }, /* @__PURE__ */ import_react6.default.createElement("div", { style: {
    display: "flex",
    gap: "5px",
    marginBottom: "5px",
    width: "100%",
    alignItems: "center"
  } }, /* @__PURE__ */ import_react6.default.createElement("span", { style: {
    color: "grey",
    fontSize: "10px"
  } }, message?.pid), /* @__PURE__ */ import_react6.default.createElement("span", { style: {
    color: "white",
    fontSize: "10px"
  } }, message?.type), /* @__PURE__ */ import_react6.default.createElement("span", null, message?.host), /* @__PURE__ */ import_react6.default.createElement("span", null, message?.target)), /* @__PURE__ */ import_react6.default.createElement("span", null, message?.printMsg))));
}
function SystemStatus() {
  useWindow("#system-status");
  const ns = (0, import_react6.useContext)(NetscriptContext);
  (0, import_react6.useEffect)(() => {
    ns.ui.resizeTail(1200, 500);
    ns.ui.moveTail(win.innerWidth / 2 - 512, win.innerHeight / 2 - 250, ns.pid);
    ns.ui.setTailTitle("System Status");
  }, []);
  const [messages, setMessages] = (0, import_react6.useState)([]);
  const [status, setStatus] = (0, import_react6.useState)({});
  const [backdoors, setBackdoors] = (0, import_react6.useState)({});
  useInterval(() => {
    const portHandle = ns.getPortHandle(config.cncPort);
    while (!portHandle.empty()) {
      setMessages((messages2) => {
        return [MessageFactory(ns, portHandle.read()), ...messages2];
      });
    }
    setStatus({
      "prep-all": isRunningByName(ns, "prep-all.js", "home"),
      "nuke-net": isRunningByName(ns, "nuke-net.js", "home"),
      "hacknet": isRunningByName(ns, "tools/hacknet.js", "home"),
      "servers": isRunningByName(ns, "tools/servers.js", "home"),
      "secWatch": isRunningByName(ns, "secWatch.js", "home"),
      "moneyWatch": isRunningByName(ns, "moneyWatch.js", "home")
    });
    setBackdoors({
      "avmnite-02h": ns.getServer("avmnite-02h").backdoorInstalled,
      "I.I.I.I": ns.getServer("I.I.I.I").backdoorInstalled,
      "run4theh111z": ns.getServer("run4theh111z").backdoorInstalled
    });
  }, 1e3, []);
  return /* @__PURE__ */ import_react6.default.createElement("div", { id: "system-status", style: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "5px",
    padding: "5px",
    boxSizing: "border-box"
  } }, /* @__PURE__ */ import_react6.default.createElement("div", { style: { height: "32px", width: "100%" } }, /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(" + Object.entries(status).length + ", 1fr)",
        justifyContent: "center",
        gap: "5px",
        color: "white"
      }
    },
    Object.entries(status).map(([key, pid]) => /* @__PURE__ */ import_react6.default.createElement(StatusCell, { active: pid !== null, name: key, pid }))
  )), /* @__PURE__ */ import_react6.default.createElement("div", { style: { maxHeight: "100%", height: "90%", width: "80%" } }, /* @__PURE__ */ import_react6.default.createElement("span", null, "Port messages"), /* @__PURE__ */ import_react6.default.createElement(MessageLog, { messages })), /* @__PURE__ */ import_react6.default.createElement("div", { style: { width: "calc(20% - 5px)" } }, /* @__PURE__ */ import_react6.default.createElement("span", null, "Backdoors"), Object.entries(backdoors).map(([key, installed]) => /* @__PURE__ */ import_react6.default.createElement("div", { key }, /* @__PURE__ */ import_react6.default.createElement(StatusCell, { active: installed, name: key })))));
}

// servers/home/cnc/ui.tsx
async function main2(ns) {
  ns.ui.closeTail();
  await ns.sleep(0);
  const mp = createMountingPoint(ns, {
    closeOnExit: false
  });
  ns.atExit(() => mp.cleanup());
  return mp.mount(/* @__PURE__ */ import_react7.default.createElement(SystemStatus, null));
}
export {
  main2 as main
};

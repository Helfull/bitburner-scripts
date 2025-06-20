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
export {
  CleanupContext,
  ContextCollection,
  NetscriptContext,
  TerminateContext,
  containsRecursive,
  createMountingPoint
};

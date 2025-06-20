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

// servers/home/lib/hooks/WindowHelper.ts
var import_react = __toESM(require_react());
function useWindow(appNodeId) {
  const [width, setWidth] = (0, import_react.useState)(0);
  const [height, setHeight] = (0, import_react.useState)(0);
  const [collapsed, setCollapsed] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
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
export {
  useWindow
};

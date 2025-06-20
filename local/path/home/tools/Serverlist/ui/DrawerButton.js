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

// servers/home/tools/Serverlist/ui/DrawerButton.tsx
var import_react3 = __toESM(require_react());

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
var import_react = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var import_react2 = __toESM(require_react());
var NetscriptContext = (0, import_react2.createContext)(null);
var CleanupContext = (0, import_react2.createContext)(null);
var TerminateContext = (0, import_react2.createContext)(null);

// servers/home/tools/Serverlist/ui/DrawerButton.tsx
var classNameMaps = {
  drawerButton: {
    active: "css-jycw4o-listitem-active",
    inactive: "css-1ep7lp0-listitem"
  },
  icon: {
    active: "css-wz14si",
    inactive: "css-16w0lv1"
  },
  text: {
    active: "css-nb0kay",
    inactive: "css-1dosjox"
  }
};
function toggleStyle(btnElement, active) {
  return classNameMaps[btnElement][active ? "active" : "inactive"];
}
function toggleElement(btnElement, active) {
  const elements = doc.querySelectorAll(`.MuiCollapse-root .${toggleStyle(btnElement, !active)}`);
  elements.forEach((element) => {
    if (element.id === "serverlist-drawer-button")
      return;
    element.classList.remove(classNameMaps[btnElement].active);
    element.classList.add(classNameMaps[btnElement].inactive);
  });
}
function DrawerButton({ bbContentContainer: bbContentContainer2 }) {
  const cleanUp = (0, import_react3.useContext)(CleanupContext);
  const [open, setOpen] = (0, import_react3.useState)(false);
  const [bbContainerStyle, setBBContainerStyle] = (0, import_react3.useState)("");
  const allOtherButtons = doc.querySelectorAll(`.${classNameMaps.drawerButton.inactive}`);
  const handler = (button) => {
    button.addEventListener("click", () => {
      setOpen(false);
    });
  };
  allOtherButtons.forEach(handler);
  cleanUp(() => {
    allOtherButtons.forEach((button) => {
      button.removeEventListener("click", handler);
    });
  });
  (0, import_react3.useEffect)(() => {
    const serverlistContentContainer = doc.querySelector("#serverlist-content-container");
    toggleElement("drawerButton", !open);
    toggleElement("icon", !open);
    toggleElement("text", !open);
    if (open) {
      setBBContainerStyle(bbContentContainer2.style.display);
      bbContentContainer2.style.display = "none";
      serverlistContentContainer.style.display = "block";
    } else {
      bbContentContainer2.style.display = bbContainerStyle;
      serverlistContentContainer.style.display = "none";
    }
  }, [open]);
  return /* @__PURE__ */ import_react3.default.createElement("div", { id: "serverlist-drawer-button", className: [
    "MuiButtonBase-root MuiListItem-root MuiListItem-gutters MuiListItem-padding MuiListItem-button",
    open ? classNameMaps.drawerButton.active : classNameMaps.drawerButton.inactive
  ].join(" "), onClick: () => setOpen(true) }, /* @__PURE__ */ import_react3.default.createElement(ButtonStyled, { open }));
}
function ButtonStyled({ open }) {
  return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "MuiListItemIcon-root css-1f8bwsm" }, /* @__PURE__ */ import_react3.default.createElement(
    "svg",
    {
      className: [
        "MuiSvgIcon-root MuiSvgIcon-colorPrimary MuiSvgIcon-fontSizeMedium",
        open ? classNameMaps.icon.active : classNameMaps.icon.inactive
      ].join(" "),
      viewBox: "0 0 20 20",
      focusable: "false",
      "aria-hidden": "true",
      "aria-label": "Active Scripts"
    },
    /* @__PURE__ */ import_react3.default.createElement("g", { id: "Page-1", "stroke-width": "1", "fill-rule": "evenodd" }, /* @__PURE__ */ import_react3.default.createElement("g", { id: "icon-shape" }, /* @__PURE__ */ import_react3.default.createElement("path", { d: "M0,2 L20,2 L20,18 L0,18 L0,2 Z M2,4 L18,4 L18,16 L2,16 L2,4 Z M6,4 L8,4 L8,16 L6,16 L6,4 Z M12,4 L14,4 L14,16 L12,16 L12,4 Z", id: "Combined-Shape" })))
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "MuiListItemText-root css-1tsvksn" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: [
    "MuiTypography-root MuiTypography-body1",
    open ? classNameMaps.text.active : classNameMaps.text.inactive
  ].join(" ") }, "Serverlist")), /* @__PURE__ */ import_react3.default.createElement("span", { className: "MuiTouchRipple-root css-w0pj6f" }));
}
export {
  DrawerButton
};

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
function ramAvailable(ns, server) {
  return Math.floor(ns.getServerMaxRam(getHostname(ns, server)) - ns.getServerUsedRam(getHostname(ns, server)));
}

// servers/home/server/filter.ts
var CAN_HACK = (ns) => (server) => CAN_BE_NUKED(ns)(server) && HAS_ADMIN_ACCESS(ns)(server);
var IS_HACKABLE = CAN_HACK;
var CAN_HAVE_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var HAS_MAX_PORTS = (ns, maxPorts) => (server) => ns.getServerNumPortsRequired(getHostname(ns, server)) <= maxPorts;
var CAN_BE_NUKED = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
var IS_GOOD_TARGET = (ns) => (server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) / 2 <= ns.getHackingLevel();
var HAS_RAM_AVAILABLE = (ns) => (server) => ns.getServerMaxRam(getHostname(ns, server)) > 0 && ns.getServerUsedRam(getHostname(ns, server)) < ns.getServerMaxRam(getHostname(ns, server));
var HAS_ADMIN_ACCESS = (ns) => (server) => ns.hasRootAccess(getHostname(ns, server));
var HAS_NO_ADMIN_ACCESS = (ns) => (server) => !HAS_ADMIN_ACCESS(ns)(server);
var HAS_MONEY = (ns) => (server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
var HAS_MAX_MONEY = (ns) => (server) => ns.getServerMoneyAvailable(getHostname(ns, server)) >= ns.getServerMaxMoney(getHostname(ns, server));
var HAS_NOT_MAX_MONEY = (ns) => (server) => !HAS_MAX_MONEY(ns)(server);
var HAS_MIN_SECURITY = (ns) => (server) => ns.getServerSecurityLevel(getHostname(ns, server)) <= ns.getServerMinSecurityLevel(getHostname(ns, server));
var HAS_NOT_MIN_SECURITY = (ns) => (server) => !HAS_MIN_SECURITY(ns)(server);
var HAS_AVAILABLE_RAM = (ns) => (server, ram) => HAS_RAM_AVAILABLE(ns)(server) && ramAvailable(ns, server) > ram;
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);
var IS_HOME = (ns) => (server) => getHostname(ns, server) === "home";
var IS_NOT_HOME = (ns) => (server) => !IS_HOME(ns)(server);
var IS_PREPPED = (ns) => (server) => HAS_MAX_MONEY(ns)(server) && HAS_MIN_SECURITY(ns)(server);
var NEEDS_PREP = (ns) => (server) => HAS_NOT_MAX_MONEY(ns)(server) || HAS_NOT_MIN_SECURITY(ns)(server);
export {
  CAN_BE_NUKED,
  CAN_HACK,
  CAN_HAVE_MONEY,
  HAS_ADMIN_ACCESS,
  HAS_AVAILABLE_RAM,
  HAS_MAX_MONEY,
  HAS_MAX_PORTS,
  HAS_MIN_SECURITY,
  HAS_MONEY,
  HAS_NOT_MAX_MONEY,
  HAS_NOT_MIN_SECURITY,
  HAS_NO_ADMIN_ACCESS,
  HAS_RAM_AVAILABLE,
  IS_GOOD_TARGET,
  IS_HACKABLE,
  IS_HOME,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
  IS_PREPPED,
  IS_PRIVATE,
  NEEDS_PREP
};

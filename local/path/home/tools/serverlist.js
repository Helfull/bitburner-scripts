// servers/home/server/utils.ts
function getHostname(ns, server) {
  if (typeof server === "string") return server;
  return server.hostname;
}

// servers/home/config.js
var config = {
  // Which server is the hacklvl farm
  farmTarget: ["foodnstuff", "n00dles"],
  farmRamPercentage: 0.7,
  farmHost: "home",
  // The prefix for private servers
  prefixPrivate: "pserv-",
  // Max ram tier,
  maxRamTier: 20,
  // Proto
  proto: {
    attackTop: 100
  },
  hacknet: {
    // The amount of money that should be kept in the player's account
    // as a buffer after doing a purchase
    moneyPercentageBuffer: 0.5
  }
};

// servers/home/server/filter.ts
var IS_PRIVATE = (ns) => (server) => getHostname(ns, server).startsWith(config.prefixPrivate);
var IS_NOT_PRIVATE = (ns) => (server) => !IS_PRIVATE(ns)(server);

// servers/home/cnc/lib.ts
var pServerPrefix = config.prefixPrivate;
function getServers(ns) {
  const servers = ns.scan();
  for (let i = 0; i < servers.length; i++) {
    const neighbors = ns.scan(servers[i]);
    for (const neighbor of neighbors) {
      if (servers.includes(neighbor)) continue;
      servers.push(neighbor);
    }
  }
  return servers;
}
function weight2(ns, server) {
  if (!server) return 0;
  if (server.startsWith("hacknet-node")) return 0;
  const player = ns.getPlayer();
  const so = ns.getServer(server);
  so.hackDifficulty = so.minDifficulty;
  if ((so.requiredHackingSkill || 0) > player.skills.hacking) return 0;
  let weight3 = (so.moneyMax || 0) / (so.minDifficulty || 1);
  if (ns.fileExists("Formulas.exe")) {
    weight3 = (so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
  } else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2)
    return 0;
  return weight3;
}

// servers/home/server/sort.ts
var BY_WEIGHT = (ns) => (a, b) => weight2(ns, getHostname(ns, b)) - weight2(ns, getHostname(ns, a));
var BY_HACKABLE = (ns) => (a, b) => ns.getServerRequiredHackingLevel(getHostname(ns, a)) - ns.getServerRequiredHackingLevel(getHostname(ns, b));
var BY_RAM_USAGE_PERCENTAGE = (ns) => (a, b) => a.ramUsed / a.maxRam - b.ramUsed / b.maxRam;

// servers/home/tools/serverlist.ts
async function main(ns) {
  const servers = getServers(ns);
  const total = {
    maxRam: 0,
    usedRam: 0
  };
  const serversTable = servers.map((server) => ns.getServer(server)).filter(IS_NOT_PRIVATE(ns)).sort(BY_RAM_USAGE_PERCENTAGE(ns)).sort(BY_WEIGHT(ns)).sort(BY_HACKABLE(ns)).reduce((table, server, i) => {
    table.index?.push(i.toString());
    table.weight?.push(ns.formatNumber(weight(ns, server.hostname)));
    table.name?.push(server.hostname);
    table.maxRam?.push(ns.formatRam(server.maxRam, 0));
    total.maxRam = total.maxRam + server.maxRam;
    table.usedRam?.push(ns.formatRam(server.ramUsed));
    total.usedRam = total.usedRam + server.ramUsed;
    table.usedRamPercent?.push(progressBar(ns, server.ramUsed, server.maxRam));
    table.rootAccess?.push(bool(server.hasAdminRights));
    table.backdoorInstalled?.push(bool(server.backdoorInstalled || false));
    table.hackable?.push(bool((server.requiredHackingSkill || 0) <= ns.getHackingLevel()));
    table.hackSkill?.push(ns.sprintf("%d", server.requiredHackingSkill || 0));
    return table;
  }, {
    index: [],
    weight: [],
    name: [],
    maxRam: [],
    usedRam: [],
    usedRamPercent: [],
    rootAccess: [],
    backdoorInstalled: [],
    hackable: [],
    hackSkill: []
  });
  serversTable.index.push("Total");
  serversTable.maxRam.push(ns.formatRam(total.maxRam, 0));
  serversTable.usedRam.push(ns.formatRam(total.usedRam));
  serversTable.usedRamPercent.push(progressBar(ns, total.usedRam, total.maxRam));
  printTable(ns, serversTable);
}
export {
  main
};

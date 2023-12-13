/** @param {NS} ns */
export async function main(ns) {
  const hostname = ns.getHostname()

  const wknPIDs = {};
  while (true) {
    const hackingLevel = ns.getHackingLevel();

    let cncTargets = [];
    if (ns.fileExists('cnc.store.txt')) {
      const settings  = JSON.parse(ns.read("cnc.store.txt"));
      cncTargets = settings.target;
    }

    function isHard(s) {
      return ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s)
    }

    const sservers = ns.scan('home').filter(s =>
      !s.startsWith('pserv')
      && s != 'cnc'
      && s != 'home'
    );

    for (let i=0; i<sservers.length; i++) {
      const neighbors = ns.scan(sservers[i]);

      for (const neighbor of neighbors) {
        if (sservers.includes(neighbor)) continue;
        if (neighbor.startsWith('pserv-')) continue;
        if (neighbor == 'cnc') continue;
        if (neighbor == 'home') continue;
        sservers.push(neighbor)
      }
    }

    const servers = sservers
      .filter((s) => ns.getServerMaxMoney(s) > 0)
      .filter((s) => !cncTargets.includes(s))
      .filter((s) => ns.hasRootAccess(s))
      .filter((s) => ns.getServerRequiredHackingLevel(s) <= hackingLevel)
      .filter((s) => !Object.keys(wknPIDs).includes(s))
      .sort((a,b) => ns.getServerMinSecurityLevel(a) > ns.getServerMinSecurityLevel(b) ? 1 : -1)
      .sort((a,b) => ns.getWeakenTime(a) > ns.getWeakenTime(b) ? 1 : -1)

    ns.print(servers);

    for (const server of servers) {
      if (isHard(server)) {
        const wpid = ns.exec('scripts/batchWeaken.js', ns.getHostname(), 1, server)
        wknPIDs[server] = wpid;
      }

      // Wait to have more ram available
      while ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) - 20) < ns.getScriptRam('scripts/batchWeaken.js')) {
        ns.print("Waiting for more RAM to weaken more servers!")
        await ns.asleep(10000)
      }
    }


    // Add servers to attack targets
    for (const server of Object.keys(wknPIDs)) {
      if (ns.isRunning(wknPIDs[server])) continue
      ns.exec('cnc.js', 'home', 1, 'cfg', 'add-target', server)
      delete wknPIDs[server];
    }

    await ns.asleep(120000)
  }
}
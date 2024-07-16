
import { getServers, killOldScript, setupDefault } from "./cnc/lib";
import { nuke, tryPurchaseVirus } from "./cnc/nuke";
import { BY_WEIGHT } from "./server/sort";
import { HAS_NO_ADMIN_ACCESS } from "./server/filter";
import { Color } from "./colors";

export async function main(ns: NS) {
  setupDefault(ns);

  killOldScript(ns, ns.getScriptName(), ns.getServer().hostname);

  const serverCache: string[] = [];

  const stats: { virus: Record<string, boolean> } = {
    virus: {
      'BruteSSH.exe': await tryPurchaseVirus(ns, 'BruteSSH.exe'),
      'FTPCrack.exe': await tryPurchaseVirus(ns, 'FTPCrack.exe'),
      'relaySMTP.exe': await tryPurchaseVirus(ns, 'relaySMTP.exe'),
      'HTTPWorm.exe': await tryPurchaseVirus(ns, 'HTTPWorm.exe'),
      'SQLInject.exe': await tryPurchaseVirus(ns, 'SQLInject.exe'),
    }
  };

  ns.setTitle('Nuke Net');
  ns.resizeTail(715, 80);
  ns.moveTail(1010, 0);

  while (true) {

    const viruses = Object.keys(stats.virus);
    for (const virus of viruses) {
      stats.virus[virus] = await tryPurchaseVirus(ns, virus);
    }

    ns.clearLog();
    ns.print(Object.keys(stats.virus).map(v => stats.virus[v] ? Color.bold.black.greenBG.wrap(' ' + v + ' ') : Color.bold.white.redBG.wrap(' ' + v + ' ')).join(''));

    const targets = getServers(ns)
      .filter(HAS_NO_ADMIN_ACCESS(ns))
      .sort(BY_WEIGHT(ns))
      .map(s => ns.getServer(s));

    ns.print(`Targets: ${targets.map(s => `${s.hostname}(${s.openPortCount}/${s.numOpenPortsRequired})`).join(', ')}`);

    for (const server of targets) {
      if (await nuke(ns, server)) {
        serverCache.push(server.hostname);
      }
    }

    await ns.sleep(1000);
  }
}

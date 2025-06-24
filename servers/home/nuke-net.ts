import { getServers, killOldScript, setupDefault } from '@lib/utils';
import { BY_WEIGHT } from './server/sort';
import { CAN_BE_NUKED, HAS_MAX_PORTS, HAS_NO_ADMIN_ACCESS } from './server/filter';
import { Color } from './lib/colors';
import { printTableObj } from '@lib/table';
import { nuke, tryPurchaseVirus } from '@lib/nuke';

export async function main(ns: NS) {
  setupDefault(ns);

  killOldScript(ns, ns.getScriptName(), ns.getServer().hostname);

  const serverCache: string[] = [];

  const stats: { virus: Record<string, boolean> } = {
    virus: {
      'BruteSSH.exe': tryPurchaseVirus(ns, 'BruteSSH.exe'),
      'FTPCrack.exe': tryPurchaseVirus(ns, 'FTPCrack.exe'),
      'relaySMTP.exe': tryPurchaseVirus(ns, 'relaySMTP.exe'),
      'HTTPWorm.exe': tryPurchaseVirus(ns, 'HTTPWorm.exe'),
      'SQLInject.exe': tryPurchaseVirus(ns, 'SQLInject.exe'),
    },
  };

  ns.ui.setTailTitle('Nuke Net');
  ns.ui.resizeTail(715, 320);
  ns.ui.moveTail(1010, 0);

  while (true) {
    const viruses = Object.keys(stats.virus);
    for (const virus of viruses) {
      if (!stats.virus[virus]) {
        stats.virus[virus] = tryPurchaseVirus(ns, virus);
      }
    }

    ns.clearLog();
    ns.print(
      Object.keys(stats.virus)
        .map((v) =>
          stats.virus[v] ? Color.bold.black.greenBG.wrap(' ' + v + ' ') : Color.bold.white.redBG.wrap(' ' + v + ' '),
        )
        .join(''),
    );

    const canCrack = viruses.filter((v) => stats.virus[v]).length;
    const targets = getServers(ns)
      .map((s) => ns.getServer(s))
      .filter(HAS_NO_ADMIN_ACCESS(ns))
      .filter(HAS_MAX_PORTS(ns, canCrack))
      .filter(CAN_BE_NUKED(ns))
      .sort(BY_WEIGHT(ns));

    if (targets.length > 0) {
      ns.ui.resizeTail(715, 320);
      printTableObj(
        ns,
        targets.map((s) => ({
          name: s.hostname,
          openPorts: s.openPortCount,
          requiredPorts: s.numOpenPortsRequired,
          requireHackSkill: s.requiredHackingSkill,
        })),
        ns.printf,
      );
    } else {
      ns.ui.resizeTail(715, 60);
    }

    for (const server of targets) {
      if (await nuke(ns, server)) {
        serverCache.push(server.hostname);
      }
    }

    await ns.share();
  }
}

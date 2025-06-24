import { getServers, killOldScript, setupDefault } from  '@lib/utils';
import {
  HAS_ADMIN_ACCESS,
  HAS_MAX_MONEY,
  HAS_MIN_SECURITY,
  HAS_MONEY,
  IS_HACKABLE,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
} from '@/servers/home/server/filter';
import { BY_WEIGHT } from '@/servers/home/server/sort';
import { defineScript } from '@lib/flags';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Brute Force continues batch script on all hackable servers',
  });

  killOldScript(ns, 'bruteForce.js', 'home');

  ns.tprint('Brute forcing servers');

  while (true) {
    let targets = getServers(ns)
      .filter(IS_NOT_PRIVATE(ns))
      .filter(IS_NOT_HOME(ns))
      .filter(HAS_ADMIN_ACCESS(ns))
      .filter(HAS_MONEY(ns))
      .filter(HAS_MAX_MONEY(ns))
      .filter(HAS_MIN_SECURITY(ns))
      .filter(IS_HACKABLE(ns))
      .filter((s) => ns.getRunningScript('conBatch.js', 'home', s) === null)
      .sort(BY_WEIGHT(ns));

    if (targets.length === 0) {
      ns.tprint('No targets found');
      await ns.share();
      continue;
    }

    ns.tprint('Targets:', JSON.stringify(targets, null, 2));

    while (targets.length > 0) {
      const target = ns.getServer(targets.shift());

      ns.tprint('Targetting ', target.hostname);
      ns.ui.setTailTitle(ns.sprintf('Targetting %s', target.hostname));

      let pid = ns.run('conBatch.js', 1, target.hostname);

      if (pid === 0) {
        ns.tprint(`Failed to run conBatch.js on ${target}`);
        continue;
      }
    }
  }
}

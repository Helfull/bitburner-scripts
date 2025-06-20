import { getServers, killOldScript, setupDefault } from '@/servers/home/cnc/lib';
import { HAS_ADMIN_ACCESS, HAS_RAM_AVAILABLE, IS_NOT_HOME, IS_NOT_PRIVATE } from '@/servers/home/server/filter';
import { printTableObj } from '@lib/table';
import { defineScript } from '@lib/flags';

export async function main(ns: NS) {
  const script = defineScript(ns, {
    description: 'Share on idle servers',
    flags: {},
    args: {}
  });

  while(true) {
    const servers = getServers(ns)
      .filter(s => IS_NOT_HOME(ns)(s))
      .filter(s => s !== 'pserv-1')
      .filter(s => HAS_ADMIN_ACCESS(ns)(s))
      .filter(s => HAS_RAM_AVAILABLE(ns)(s));

    printTableObj(ns, servers.map(s => ({
      name: s,
      maxRam: ns.getServerMaxRam(s),
      usedRam: ns.getServerUsedRam(s),
      hasRam: HAS_RAM_AVAILABLE(ns)(s),
      hasAdmin: HAS_ADMIN_ACCESS(ns)(s),
      isPrivate: IS_NOT_PRIVATE(ns)(s),
    })), ns.printf)

    const shareOnPids = servers
      .map(target => {

        let availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);

        const threads = Math.floor(availableRam / ns.getScriptRam('share.js'));

        if (threads > 0) {

          ns.scp('share.js', target, 'home');

          return ns.exec(
            'share.js',
            target,
            Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam('share.js')),
          );
        }

        return 0;
      }).filter(Boolean);

    while(shareOnPids.some(pid => ns.isRunning(pid))) {

      ns.clearLog();

      printTableObj(ns, servers.map(s => ({
        name: s,
        maxRam: ns.getServerMaxRam(s),
        usedRam: ns.getServerUsedRam(s),
        hasRam: HAS_RAM_AVAILABLE(ns)(s),
        hasAdmin: HAS_ADMIN_ACCESS(ns)(s),
        isPrivate: IS_NOT_PRIVATE(ns)(s),
      })), ns.printf)

      ns.printf(`Waiting for share.js to finish on ${shareOnPids.length} servers. [${shareOnPids.join(', ')}]`);

      await ns.sleep(1000);
    }
    await ns.sleep(100);
  }
}

import { getServers, killOldScript, setupDefault } from '@/servers/home/cnc/lib';
import { IS_NOT_HOME, IS_NOT_PRIVATE } from '@/servers/home/server/filter';

export async function main(ns: NS) {
  const args = setupDefault<{ includePrivate: boolean }>(ns, [['includePrivate', false]]);
  killOldScript(ns, 'share-all.js', 'home');
  while (true) {
    getServers(ns)
      .filter((s) => args.includePrivate || IS_NOT_HOME(ns)(s))
      .filter((s) => args.includePrivate || IS_NOT_PRIVATE(ns)(s))
      .forEach((server) => {
        ns.scp('share.js', server, 'home');

        let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

        const threads = Math.floor(availableRam / ns.getScriptRam('share.js'));

        if (threads > 0) {
          ns.exec(
            'share.js',
            server,
            Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam('share.js')),
          );
        }
      });

    await ns.share();
    await ns.sleep(500);
  }
}

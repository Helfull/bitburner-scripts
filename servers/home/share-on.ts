import { getServers, killOldScript, setupDefault } from '@/servers/home/cnc/lib';
import { IS_NOT_HOME, IS_NOT_PRIVATE } from '@/servers/home/server/filter';

export async function main(ns: NS) {

  const target = ns.args[0] as string | undefined;

  ns.scp('share.js', target, 'home');

  while(true) {
    let availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);

    const threads = Math.floor(availableRam / ns.getScriptRam('share.js'));

    if (threads > 0) {
      ns.exec(
        'share.js',
        target,
        Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam('share.js')),
      );
    }

    await ns.sleep(1000);
  }
}

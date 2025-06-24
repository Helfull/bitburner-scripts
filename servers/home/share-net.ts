import { defineScript } from '@lib/flags';
import { config } from '@/servers/home/config';
import { ramAvailable } from '@/servers/home/server/utils';
import { getServers } from '@lib/utils';
import { IS_NOT_HOME, IS_PRIVATE } from '@/servers/home/server/filter';

export async function main(ns: NS) {
  const script = defineScript(ns, {
    description: 'Share your RAM with other players',
    flags: {
      targets: {
        description: 'The target server to share RAM with',
        defaultValue: config.repShareServers,
      },
      shareAllPrivate: {
        description: 'Share RAM with all private servers',
        defaultValue: config.repShareAllPrivate,
      }
    },
  });

  const targets = script.targets;

  ns.print(`Sharing RAM with targets: ${JSON.stringify(targets, null, 2)}`);

  const pids = {};

  while(true) {
    ns.printf(`Currently sharing RAM with: ${JSON.stringify(Object.keys(pids), null, 2)}`);

    const allTargets = [
      ...(
        script.shareAllPrivate ? (
          getServers(ns)
            .filter(IS_PRIVATE(ns))
            .filter(IS_NOT_HOME(ns))
            .filter((server) => !config.repSharePrivateExclude.includes(server))
      ) : []),
      ...targets
    ];

    for (const target of allTargets) {
      if (ns.serverExists(target) && (!pids[target] || !ns.isRunning(pids[target]))) {
        ns.scp('lib/share.js', target, 'home');

        const threads = Math.floor(ramAvailable(ns, target) / ns.getScriptRam('lib/share.js', target));

        ns.print(`Sharing RAM with ${target}`);
        ns.print(`Available RAM on ${target}: ${ns.formatRam(ramAvailable(ns, target))}`);
        ns.print(`Script RAM on ${target}: ${ns.formatRam(ns.getScriptRam('lib/share.js', target))}`);
        ns.print(`Threads to run: ${threads}`);

        if (threads <= 0) {
          ns.print(`Not enough RAM to run share script on ${target}`);
          continue;
        }

        pids[target] = ns.exec('lib/share.js', target, { threads }, target);
        await ns.sleep(100); // Wait a bit to ensure the script starts
      }
    }

    await ns.sleep(1000); // Adjust the sleep time as needed
  }
}
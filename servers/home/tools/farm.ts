import { defineScript } from '@lib/flags';
import { config } from '@/servers/home/config';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Farm a list of target servers',
    flags: {
      target: {
        description: 'The target server to farm',
        defaultValue: '',
      },
    },
  });

  const target = args.target;

  ns.print(JSON.stringify(target, null, 2));

  ns.scp('tools/farm/weaken.js', config.farmHost, 'home');
  ns.scp('tools/farm/grow.js', config.farmHost, 'home');
  ns.scp('tools/farm/hack.js', config.farmHost, 'home');

  const availableRam = ns.getServerMaxRam(config.farmHost) - ns.getServerUsedRam(config.farmHost);
  const weakenThreads = Math.floor(availableRam / 3 / ns.getScriptRam('tools/farm/weaken.js'));
  const growThreads = Math.floor(availableRam / 3 / ns.getScriptRam('tools/farm/grow.js'));
  const hackThreads = Math.floor(availableRam / 3 / ns.getScriptRam('tools/farm/hack.js'));

  while(true) {
    const pids = [];

    ns.print(`Starting farm on ${target} with ${weakenThreads} weaken, ${growThreads} grow, and ${hackThreads} hack threads`);

    pids.push(ns.exec('tools/farm/weaken.js', config.farmHost, { threads: weakenThreads }, '--target', target.toString()));
    pids.push(ns.exec('tools/farm/grow.js', config.farmHost, { threads: growThreads }, '--target', target.toString()));
    pids.push(ns.exec('tools/farm/hack.js', config.farmHost, { threads: hackThreads }, '--target', target.toString()));

    while(pids.some((pid) => ns.isRunning(pid))) {
      ns.print('Waiting for scripts to finish');
      await ns.sleep(1000);
    }

    await ns.sleep(1000); // Wait a bit before starting again
  }

}

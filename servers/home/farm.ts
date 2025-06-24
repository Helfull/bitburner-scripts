import { defineScript } from '@lib/flags';
import { config } from './config';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Farm a list of target servers',
    flags: {
      targets: {
        description: 'The target server to farm',
        defaultValue: config.farmTarget,
      },
    },
  });

  const targets = args.targets;

  ns.print(JSON.stringify(targets, null, 2));

  const pids = {};

  for (const target of targets) {
    pids[target] = await start(ns, target);
  }

  while(true) {
    const runningTargets = Object.keys(pids);

    for (const target of runningTargets) {
      if (!pids[target].isRunning()) {
        ns.print(`Target ${target} is not running, restarting...`);
        pids[target] = await start(ns, target);
      }
    }

    await ns.sleep(1000);
  }
}

async function start(ns: NS, target: string): Promise<{ pid: number, isRunning: () => boolean }> {
  ns.print(`Targetting ${target}`);
  const pid = ns.exec('tools/farm.js', config.farmHost, {}, '--target', target);
  await ns.sleep(100);
  return { pid, isRunning: () => ns.isRunning(pid) };
}

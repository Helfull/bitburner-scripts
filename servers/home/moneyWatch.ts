
import { setupDefault } from "./cnc/lib";
import { config } from "./config";


export async function main(ns: NS) {

  const args = setupDefault(ns);

  const targets = config.farmTarget;

  ns.print(JSON.stringify(targets, null, 2));

  ns.scp('tools/farm/grow.js', config.farmHost, 'home');


  const targetWknPids = {};

  while(true) {

    ns.clearLog();
    ns.print('Current grow:');
    ns.print(JSON.stringify(targetWknPids, null, 2));

    for (const target in targetWknPids) {
      if (!ns.isRunning(targetWknPids[target], config.farmHost)) {
        delete targetWknPids[target];
      }
    }

    const availableRam = ns.getServerMaxRam(config.farmHost) - ns.getServerUsedRam(config.farmHost);
    const perTarget = Math.floor(availableRam / (targets.length));
    const growThreads = Math.floor(perTarget / ns.getScriptRam('tools/farm/grow.js'));

    ns.print(`INFO | Available RAM: ${ns.formatRam(availableRam)}`);
    ns.print(`INFO | Per Target: ${ns.formatRam(perTarget)}`);
    ns.print(`INFO | grow Threads per target: ${growThreads}`);

    if (growThreads < 1) {
      ns.print('ERROR | Not enough RAM to run grow on any target');
      await ns.sleep(1000);
      continue;
    }

    for (const target of targets) {
      if (targetWknPids[target] === undefined && ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        ns.print(`Targetting ${target}`);
        targetWknPids[target] = ns.exec('tools/farm/grow.js', config.farmHost, growThreads, '--target', target, growThreads);

        if (targetWknPids[target] === 0) {
          delete targetWknPids[target];

          ns.print(`ERROR | Failed to start grow on ${target}`);
        }
      }
      await ns.sleep(100);
    }
  }
}

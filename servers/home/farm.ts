
import { setupDefault } from "./cnc/lib";
import { config } from "./config";


export async function main(ns: NS) {

  const args = setupDefault(ns);

  const targets = config.farmTarget;

  ns.print(JSON.stringify(targets, null, 2));

  ns.scp('tools/farm/weaken.js', config.farmHost, 'home');
  ns.scp('tools/farm/grow.js', config.farmHost, 'home');

  const availableRam = ns.getServerMaxRam(config.farmHost) - ns.getServerUsedRam(config.farmHost);
  const perTarget = Math.floor(availableRam / (targets.length));
  const weakenThreads = Math.floor(perTarget / 2 / ns.getScriptRam('tools/farm/weaken.js'));
  const growThreads = Math.floor(perTarget / 2 / ns.getScriptRam('tools/farm/grow.js'));

  for (const target of targets) {
    ns.print(`Targetting ${target}`);
    ns.exec('tools/farm/weaken.js', config.farmHost, weakenThreads, '--target', target, weakenThreads);
    ns.exec('tools/farm/grow.js', config.farmHost, growThreads, '--target', target, growThreads);

    await ns.sleep(100);
  }
}

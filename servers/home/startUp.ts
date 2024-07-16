import { setupDefault } from "./cnc/lib";


export async function main(ns: NS) {
  const args = setupDefault(ns);
  ns.clearLog();
  ns.print('Starting up');
  await start(ns, 'cnc/main.js');

  await start(ns, 'nuke-net.js');
  await start(ns, 'prep-all.js');

  await start(ns, 'tools/hacknet.js');

  ns.print('Waiting for private server');
  while (ns.getPurchasedServers().length === 0) {
    await ns.sleep(10000);
  }

  await start(ns, 'secWatch.js');
  await start(ns, 'moneyWatch.js');
}

async function start(ns: NS , script: string) {

  if (ns.isRunning(script)) {
    ns.print(`Already running ${script}`);
    return;
  }

  ns.print(`Starting ${script}`);
  ns.run(script, 1);
  await ns.sleep(1000);
}

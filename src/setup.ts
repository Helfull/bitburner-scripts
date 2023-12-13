import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.exec('cnc.js', 'home', 1, 'spread');

  await ns.sleep(5000);

  ns.print('Setting up hacknet on home')
  ns.exec('hacknet.js', 'home', 1);

  ns.exec('cnc.js', 'home', 1, 'fill');

  ns.exec('prep-loop.js', 'home', 1);

  await backdoorAt(ns, 'CSEC', 58);
  await backdoorAt(ns, 'avmnite-02h', 202);
  await backdoorAt(ns, 'I.I.I.I', 347);
  await backdoorAt(ns, 'run4theh111z', 539);
  await backdoorAt(ns, '.', 512);
  await backdoorAt(ns, 'The-Cave', 925);
}

async function backdoorAt(ns: NS, server: string, hLVL: number) {
  if (ns.getServer(server).backdoorInstalled) return;
  ns.printf('Backdooring %s at hacking level %s', server, hLVL);

  while (ns.getHackingLevel() <= hLVL) {
    ns.printf('Waiting for hacking level %s to backdoor %s', hLVL, server);
    await ns.sleep(10000);
  }

  while (!ns.hasRootAccess(server)) {
    ns.print('Waiting for root access to backdoor %s', server);
    await ns.sleep(10000);
  }

  ns.exec('cnc.js', 'home', 1, 'spread');
  await ns.sleep(10000);
  ns.exec('trace.js', 'home', 1, '--find', server, '--process', '--canBackdoor');
}
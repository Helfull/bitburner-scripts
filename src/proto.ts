import { NS } from "@ns";
import { getServers, weight } from "./cnc/lib";

export async function main(ns: NS) {
  const topN = ns.args[0] as number || 5;
  ns.disableLog('ALL');
  ns.tail();
  ns.atExit(() => ns.closeTail());
  ns.resizeTail(800, 160);

  const targets = getServers(ns)
    .sort((a, b) => weight(ns, b) - weight(ns, a))
    .filter(s => {
      const mon = ns.getServerMoneyAvailable(s);
      const maxMon = ns.getServerMaxMoney(s);
      const sec = ns.getServerSecurityLevel(s);
      const minSec = ns.getServerMinSecurityLevel(s);
      return (mon >= maxMon && sec <= minSec && maxMon > 0);
    })
    .slice(0, topN);

  ns.setTitle(ns.sprintf('Targetting %s', targets.join(', ')));

  for (const target of targets) {
    ns.tprint(ns.sprintf('Targetting %s', target));
    const pid = ns.exec('t.js', 'home', 1, target, 0.5);

    if (!pid) throw new Error('Failed to start t.js');
    await ns.asleep(200)
  }
}
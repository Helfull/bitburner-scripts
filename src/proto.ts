import { NS } from "@ns";
import { getServers, weight } from "./cnc/lib";

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.atExit(() => ns.closeTail());
  ns.resizeTail(800, 160);

  const targets = getServers(ns)
    .sort((a, b) => weight(ns, b) - weight(ns, a))
    .slice(0, 5);

  ns.setTitle(ns.sprintf('Targetting %s', targets.join(', ')));

  for (const target of targets) {
    ns.run('t.js', 1, target);
  }
}
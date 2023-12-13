import { NS } from "@ns";
import { getServers, weight } from "./cnc/lib";

export async function main(ns: NS) {
  const topServers = getServers(ns)
    .sort((a, b) => weight(ns, b) - weight(ns, a))
    .slice(0, 5)

  for (const s of topServers) {
    ns.run('prep.js', {
      threads: 1,
      preventDuplicates: true,
    }, s);
    await ns.asleep(1000);
  }

  ns.atExit(() => {
    ns.tprintf('INFO | Setup complete 1');
  });
}
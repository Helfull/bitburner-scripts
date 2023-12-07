import { NS } from "@ns";
import { BatchRunner } from "./batcher/BatchRunner";
import { RAMManager } from "./batcher/RamManager";
import { getServers } from "./cnc/lib";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  ns.disableLog('ALL');
  ns.tail();
  ns.atExit(() => ns.closeTail());
  ns.resizeTail(800, 160);
  ns.setTitle(ns.sprintf('Targetting %s', target));
  const batcher = new BatchRunner(ns,
    new RAMManager(ns, getServers(ns).filter(s => s !== 'pserv-preWeaken').map(ns.getServer))
  );

  await batcher.execute(target)
}
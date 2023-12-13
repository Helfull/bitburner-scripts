import { NS } from "@ns";
import { RAMManager } from "./batcher/RamManager";
import { getServers } from "./cnc/lib";
import { ProtoBatcher } from "./batcher/ProtoBatcher";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const greed = ns.args[1] as number;

  ns.tprintf('Targetting %s, Greed: %s', target, greed);

  ns.disableLog('ALL');
  ns.tail();
  ns.atExit(() => ns.closeTail());
  ns.resizeTail(800, 160);
  ns.setTitle(ns.sprintf('Targetting %s', target));
  const batcher = new ProtoBatcher(ns,
    new RAMManager(ns, getServers(ns).filter(s => s !== 'pserv-preWeaken').map(ns.getServer))
  );

  await batcher.loop(target, greed)
}
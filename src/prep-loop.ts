import { NS } from "../NetscriptDefinitions";
import { Prepper } from "batcher/Prepper";
import { RAMManager } from "batcher/RamManager";
import { getServers } from "cnc/lib";

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.atExit(() => ns.closeTail());
  ns.resizeTail(800, 160);
  ns.setTitle("Prep Loop");
  const prepper = new Prepper(ns,
    new RAMManager(ns, getServers(ns).filter(s => s !== 'pserv-preWeaken').map(ns.getServer))
  );
  await prepper.loop()
}
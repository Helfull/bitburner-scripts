
import { BatchRunner } from "../batcher/BatchRunner";
import { RAMManager } from "../batcher/RamManager";
import { getServers, setupDefault } from "../cnc/lib";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);
  ns.setTitle(ns.sprintf('Targetting %s', target));
  const batcher = new BatchRunner(ns,
    new RAMManager(ns, getServers(ns).filter((s : string) => s !== 'pserv-preWeaken').map(ns.getServer))
  );

  await batcher.execute(target)
}

import { Prepper } from "./batcher/Prepper";
import { RAMManager } from "./batcher/RamManager";
import { getServers, setupDefault } from "./cnc/lib";
import { IS_NOT_HOME } from "./server/filter";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);
  ns.setTitle(ns.sprintf('Prep %s', target));
  const prepper = new Prepper(ns,
    new RAMManager(ns, getServers(ns).map(ns.getServer))
  );
  await prepper.execute(target)
}

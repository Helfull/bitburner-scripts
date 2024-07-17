import { RAMManager } from "./batcher/RamManager";
import { ShutgunBatcher } from "./batcher/ShutgunBatcher";
import { getServers, setupDefault } from "./cnc/lib";
import { config } from "./config";
import { BY_RAM_USAGE } from "./server/sort";

export async function main(ns: NS) {
  const args = setupDefault(ns, [["target", "n00dles"]]);

  ns.clearLog();

  const proto = new ShutgunBatcher(
    ns,
    new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer))
  );

  await proto.loop(args.target as string);
}

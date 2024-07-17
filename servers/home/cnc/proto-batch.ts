import { getServers, setupDefault } from "../cnc/lib";
import { ProtoBatcher } from "../batcher/ProtoBatcher";
import { RAMManager } from "../batcher/RamManager";
import { BY_RAM_USAGE } from "../server/sort";
import { IS_NOT_HOME } from "../server/filter";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);

  ns.clearLog();

  const proto = new ProtoBatcher(
    ns,
    new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer))
  );

  await proto.loop(target);
}

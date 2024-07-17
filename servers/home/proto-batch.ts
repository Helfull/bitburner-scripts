import { Metrics } from "./batcher/Metrics";
import { ProtoBatcher } from "./batcher/ProtoBatcher";
import { RAMManager } from "./batcher/RamManager";
import { getServers, setupDefault } from "./cnc/lib";
import { config } from "./config";
import { BY_RAM_USAGE } from "./server/sort";
import { Logger } from "./tools/logger";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);

  ns.clearLog();

  const proto = new ProtoBatcher(
    ns,
    new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer)),
    new Metrics(ns),
    new Logger(ns),
    config.proto
  );

  await proto.loop(target);
}

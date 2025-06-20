import { ContinuesBatcher } from '@/servers/home/batcher/ContinuesBatcher';
import { Metrics } from './batcher/Metrics';
import { RAMManager } from './batcher/RamManager';
import { getServers, setupDefault } from './cnc/lib';
import { config } from './config';
import { BY_RAM_USAGE } from './server/sort';
import { Logger } from './tools/logger';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);

  ns.clearLog();

  const proto = new ContinuesBatcher(
    ns,
    new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer)),
    new Metrics(ns, 0),
    new Logger(ns),
    config.proto,
  );

  if (target) {
    await proto.loop(target);
  } else {
    await proto.autoTarget();
  }
}

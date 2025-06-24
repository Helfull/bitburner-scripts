import { Metrics } from './batcher/Metrics';
import { ProtoBatcher } from './batcher/ProtoBatcher';
import { RAMManager } from './batcher/RamManager';
import { getServers, setupDefault } from '@lib/utils';
import { config } from './config';
import { BY_RAM_USAGE } from './server/sort';
import { Logger } from './tools/logger';
import { Lock } from '@lib/lock';

export async function main(ns: NS) {
  const log: Logger = new Logger(ns);
  const target = ns.args[0] as string;
  const lock = new Lock(ns, target, log);

  const args = setupDefault(ns);

  if (lock.isLocked()) {
    log.warn('Server is locked!')
    ns.exit();
    return;
  }

  await lock.lock();

  ns.atExit(() => {
    lock.unlock();
  }, 'unlock');

  const rmm: RAMManager = new RAMManager(ns, getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer));
  rmm.getServers(() => getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer));

  const proto = new ProtoBatcher(
    ns,
    rmm,
    new Metrics(ns, 0),
    new Logger(ns),
    config.proto,
  );

  await proto.loop(target);
}

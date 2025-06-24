import { HAS_ADMIN_ACCESS } from '@/servers/home/server/filter';
import { Prepper } from './batcher/Prepper';
import { RAMManager } from './batcher/RamManager';
import { getServers, setupDefault } from '@lib/utils';
import { Logger } from '@/servers/home/tools/logger';
import { nuke } from '@lib/nuke';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  ns.clearLog();
  const log: Logger = new Logger(ns, {
    service: ns.getScriptName() + ' PID: ' + ns.pid + ' target: ' + target,
  });
  log.info(`Starting`);
  const args = setupDefault(
    ns, null, {
      disable: ['scan', 'tail'],
    }
  );
  log.debug('Setup default');
  ns.ui.setTailTitle(ns.sprintf('Prep %s', target));

  await nuke(ns, ns.getServer(target))

  log.info(`Starting RAMManager`);
  const rmm = new RAMManager(ns, getServers(ns).map(ns.getServer));
  rmm.getServers = () => getServers(ns).map(ns.getServer).filter(HAS_ADMIN_ACCESS(ns));

  await ns.sleep(1000);
  log.info(`Starting prepper`);
  const prepper = new Prepper(ns, rmm);

  await ns.sleep(1000);
  log.info(`Running prepper to ${target}`);
  await prepper.execute(target);
}

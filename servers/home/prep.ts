import { HAS_ADMIN_ACCESS } from '@/servers/home/server/filter';
import { Prepper } from './batcher/Prepper';
import { RAMManager } from './batcher/RamManager';
import { getServers, setupDefault } from './cnc/lib';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const args = setupDefault(ns);
  ns.ui.setTailTitle(ns.sprintf('Prep %s', target));
  const rmm = new RAMManager(ns, getServers(ns).map(ns.getServer));
  rmm.getServers = () => getServers(ns).map(ns.getServer).filter(HAS_ADMIN_ACCESS(ns));
  const prepper = new Prepper(ns, rmm);
  await prepper.execute(target);
}

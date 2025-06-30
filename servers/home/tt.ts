import { proxy, proxyNs } from '@lib/ram-dodge';
import { Planner } from '@/servers/home/batcher/Planner';

export async function main(ns: NS) {

  ns.disableLog('ALL');
  ns.clearLog();

  const planner = new Planner(ns, 'rho-construction');

  await planner.plan()

}

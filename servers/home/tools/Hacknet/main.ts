import { Manager } from '@/servers/home/tools/Hacknet/Manager';
import { CheapestBuy } from '@/servers/home/tools/Hacknet/Strategy/LowestCost';

export function main(ns: NS) {
  const manager = new Manager(ns);

  manager.run(CheapestBuy);
}

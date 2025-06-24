import { printTableObj } from '@lib/table';
import { killOldScript } from '@lib/utils';
import { defineScript } from '@lib/flags';
import { Manager } from '@/servers/home/tools/Hacknet/Manager';
import { CheapestBuy } from '@/servers/home/tools/Hacknet/Strategy/LowestCost';
import { Color } from '@lib/colors';
import { ProductionPerCredit } from '@/servers/home/tools/Hacknet/Strategy/ProductionPerCredit';

export async function main(ns: NS) {
  killOldScript(ns, ns.getScriptName(), ns.getServer().hostname);

  const args = defineScript(ns, {
    description: 'Manage hacknet nodes',
    flags: {
      loop: {
        description: 'Run in a loop',
        defaultValue: false,
      },
      delay: {
        description: 'The delay between runs',
        defaultValue: 50,
      },
    },
  });

  const manager = new Manager(ns);

  const headerlevel = `level [${Color.grey.wrap('next cost')}]`;
  const headerram = `ram [${Color.grey.wrap('next cost')}]`;
  const headercores = `cores [${Color.grey.wrap('next cost')}]`;

  do {
    manager.run(ProductionPerCredit);

    const nodes = manager.nodes.map((node) => ({
      id: node.index,
      name: node.name,
      [headerlevel]: node.level + ` [${Color.grey.wrap(ns.formatNumber(node.nextLevelCost))}]`,
      [headerram]: node.ram + '.00 GB' + ` [${Color.grey.wrap(ns.formatNumber(node.nextRamCost))}]`,
      [headercores]: node.cores + ` [${Color.grey.wrap(ns.formatNumber(node.nextCoreCost))}]`,
      'production / sec': Color.yellow.wrap(ns.formatNumber(node.production)),
      totalProduction: Color.yellow.wrap(ns.formatNumber(node.totalProduction)),
    }));

    printTableObj(ns, nodes, ns.printf);

    if (!manager.lastPurchase) {
      ns.print('No purchase done');
      await ns.sleep(1000);
      continue;
    }
    ns.printf(
      `Last purchase: ${manager.lastPurchase.type} for ${ns.formatNumber(manager.lastPurchase.cost)} Node: ${
        manager.lastPurchase.node?.name
      }`,
    );

    await ns.sleep(args.delay);
  } while (args.loop);
}

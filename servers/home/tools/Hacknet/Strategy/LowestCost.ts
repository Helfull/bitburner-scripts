import { Hacknet } from '@/NetscriptDefinitions';
import { Node } from '@/servers/home/tools/Hacknet/Node';
import { Purchase } from '@/servers/home/tools/Hacknet/Strategy/Strategy';

export function CheapestBuy(hacknet: Hacknet, nodes: Node[]): Purchase {
  const nextNodePurchase = hacknet.getPurchaseNodeCost();
  let cheapestOption: Purchase = { type: 'node', cost: nextNodePurchase };

  for (const node of nodes) {
    if (cheapestOption.cost > node.nextLevelCost) {
      cheapestOption = { type: 'level', node: node, cost: node.nextLevelCost };
    }

    if (cheapestOption.cost > node.nextRamCost) {
      cheapestOption = { type: 'ram', node: node, cost: node.nextRamCost };
    }

    if (cheapestOption.cost > node.nextCoreCost) {
      cheapestOption = { type: 'core', node: node, cost: node.nextCoreCost };
    }
  }

  return cheapestOption;
}

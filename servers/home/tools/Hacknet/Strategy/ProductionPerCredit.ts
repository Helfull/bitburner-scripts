import { Hacknet } from '@/NetscriptDefinitions';
import { Node } from '@/servers/home/tools/Hacknet/Node';
import { Option, Purchase } from '@/servers/home/tools/Hacknet/Strategy/Strategy';
import { Manager } from '@/servers/home/tools/Hacknet/Manager';

export function ProductionPerCredit(manager: Manager, nodes: Node[]) {
  const action: Purchase = calcForType('node', 1, 1, 1, manager.getPurchaseNodeCost());

  manager.ns.print(`New Node: ${action.cost} credits, value: ${action.value}`);

  for (const node of nodes) {
    const production = {
      level: calcForType('level', node.level + 1, node.ram, node.cores, node.nextLevelCost),
      ram: calcForType('ram', node.level, node.ram * 2, node.cores, node.nextRamCost),
      core: calcForType('core', node.level, node.ram, node.cores + 1, node.nextCoreCost),
    };

    manager.ns.print(`Node: ${node.name} (level: ${production.level.value}, ram: ${production.ram.value}, cores: ${production.core.value})`);

    // Which of the three options is the highest?
    const bestOption = Object.entries(production).reduce((best, [type, value]) => {
      if (value.value > best.value) {
        return value;
      }
      return best;
    }, { type: 'level', value: 0, cost: 0 });

    if (bestOption.value > action.value) {
      action.type = bestOption.type;
      action.node = node;
      action.cost = bestOption.cost;
      action.value = bestOption.value;
    }
  }

  if (! manager.canAfford(action.cost)) {
    return {
      type: 'node',
      cost: 0,
      value: 0,
      node: undefined,
    }
  }

  return action;
}

function calcForType(type: Option, level: number, ram: number, cores: number, cost: number) {
  const value = calcProduction(level, ram, cores);
  return {
      type,
      value: value / cost,
      cost,
    }
}

function calcProduction(level: number, ram: number, cores: number) {
  const gainPerLevel = 1.5;

  const levelMult = level * gainPerLevel;
  const ramMult = Math.pow(1.035, ram - 1);
  const coresMult = (cores + 5) / 6;
  return levelMult * ramMult * coresMult;
}
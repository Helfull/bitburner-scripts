import { setupDefault } from "../cnc/lib";
import { config } from "../config";

export async function main(ns: NS) {

  const args = setupDefault(ns);

  const hackNet = ns.hacknet;

  ns.print(`Max nodes: ${hackNet.maxNumNodes()}`);
  ns.print(`Nodes: ${hackNet.numNodes()}`);

  while (true) {
    ns.clearLog();
    ns.print(`Money: ${ns.formatNumber(getPlayerMoneyAvailable(ns))}`);

    const purchase = findCheapestPurchase(ns);

    if (purchase === null || purchase.cost > getPlayerMoneyAvailable(ns)) {
      ns.print('No purchase available');
      await ns.sleep(1000);
      continue;
    }

    ns.print(`Purchasing ${purchase.type} for node ${purchase.index} for a cost of ${ns.formatNumber(purchase.cost)}`);

    switch (purchase.type) {
      case 'node':
        purchaseNode(ns);
        break;
      case 'level':
        upgradeNodeLevels(ns, purchase.index);
        break;
      case 'ram':
        upgradeNodeRam(ns, purchase.index);
        break;
      case 'core':
        upgradeNodeCores(ns, purchase.index);
        break;
    }

    await ns.sleep(1000);
  }
}

/**
 * Returns TRUE if the node produced more than the cost
 * And the player has enough money
 *
 * @param ns NS
 * @param nodeIndex number
 * @param cost number
 * @returns boolean
 */
function purchaseCondition(ns: NS, nodeIndex: number, cost: number): boolean {
  if (ns.hacknet.getNodeStats(nodeIndex).totalProduction < cost) {
    return false;
  }


  if (getPlayerMoneyAvailable(ns) < cost) {
    return false;
  }

  return true;
}

function purchaseNode(ns: NS) {
  const hackNet = ns.hacknet;

  if (hackNet.maxNumNodes() <= hackNet.numNodes()) return;
  if (getPlayerMoneyAvailable(ns) < hackNet.getPurchaseNodeCost()) return;

  ns.print('Purchasing node');
  hackNet.purchaseNode();
}

function upgradeNodeLevels(ns: NS, nodeIndex: number) {
  const hackNet = ns.hacknet;

  if (! purchaseCondition(ns, nodeIndex, hackNet.getLevelUpgradeCost(nodeIndex))) return;

  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} from ${node.level} to ${node.level + 1}`);
  hackNet.upgradeLevel(nodeIndex);
}

function upgradeNodeRam(ns: NS, nodeIndex: number) {
  const hackNet = ns.hacknet;

  if (! purchaseCondition(ns, nodeIndex, hackNet.getRamUpgradeCost(nodeIndex))) return;

  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} ram from ${node.ram} to ${node.ram + 1}`);
  hackNet.upgradeRam(nodeIndex);
}

function upgradeNodeCores(ns: NS, nodeIndex: number) {
  const hackNet = ns.hacknet;

  if (! purchaseCondition(ns, nodeIndex, hackNet.getCoreUpgradeCost(nodeIndex))) return;

  const node = hackNet.getNodeStats(nodeIndex);
  ns.print(`Upgrading node ${nodeIndex} cores from ${node.cores} to ${node.cores + 1}`);
  hackNet.upgradeCore(nodeIndex);
}

let moneyBuffer = 0;

function getPlayerMoneyAvailable(ns: NS) {
  const playerMoney = ns.getPlayer().money;

  if (moneyBuffer === 0) {
    moneyBuffer = playerMoney - playerMoney * config.hacknet.moneyPercentageBuffer;
  }

  return ns.getPlayer().money - moneyBuffer;
}

type Purchase = {
  type: 'node'| 'level' | 'ram' | 'core';
  index: number;
  cost: number;
}

function findCheapestPurchase(ns: NS): Purchase {
  const hackNet = ns.hacknet;

  let purchase: Purchase = null;

  if (hackNet.maxNumNodes() > hackNet.numNodes()) {
    purchase = {
      type: 'node',
      index: -1,
      cost: hackNet.getPurchaseNodeCost(),
    };
  }

  for (let i = 0; i < hackNet.numNodes(); i++) {
    if (purchase.cost > hackNet.getLevelUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: 'level',
        index: i,
        cost: hackNet.getLevelUpgradeCost(i),
      };
    }

    if (purchase.cost > hackNet.getRamUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: 'ram',
        index: i,
        cost: hackNet.getRamUpgradeCost(i),
      };
    }

    if (purchase.cost > hackNet.getCoreUpgradeCost(i) && purchaseCondition(ns, i, hackNet.getLevelUpgradeCost(i))) {
      purchase = {
        type: 'core',
        index: i,
        cost: hackNet.getCoreUpgradeCost(i),
      };
    }
  }

  return purchase;
}

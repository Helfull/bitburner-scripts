import { NS } from "@ns";

const moneyThreshold = 0.01;

export async function main(ns: NS) {
  ns.disableLog('ALL');

  const hn = ns.hacknet;
  const maxNodes = Math.min(30, hn.maxNumNodes());
  ns.print(`Cur nodes: ${hn.numNodes()}`);
  ns.print(`Max nodes: ${maxNodes}`);

  while(true) {
    if (canAffordNewNode(ns)) buyNode(ns, maxNodes);
    // upgrade one node at a time
    for (let i = 0; i < hn.numNodes() && !canAffordNewNode(ns); i++) {
      ns.printf(`INFO Upgrading node %s`, i);
      await upgradeNode(ns, i);
    }

    await ns.sleep(1000);
  }
}


function canAffordNewNode(ns: NS) {
  const hn = ns.hacknet;
  return ns.getServerMoneyAvailable('home') * moneyThreshold > hn.getPurchaseNodeCost();
}

function buyNode(ns: NS, maxNodes:number) {
  const hn = ns.hacknet;
  if (maxNodes <= hn.numNodes()) return;
  const hnMoney = ns.getServerMoneyAvailable('home') * moneyThreshold;
  const cost = hn.getPurchaseNodeCost();
  if (hnMoney > cost) {
    const num = Math.floor(hnMoney / cost);
    for (let i = 0; i < num; i++) {
      hn.purchaseNode();
    }
  }
}

async function upgradeNode(ns: NS, i: number) {
  const hn = ns.hacknet;
  const upgradeMultiplier = 5;
  let needLevelUpgrade = true;
  let needRamUpgrade = true;
  let needCoreUpgrade = true;

  let canAffordLevelUpgrade = true;
  let canAffordRamUpgrade = true;
  let canAffordCoreUpgrade = true;

  while (
    (needLevelUpgrade || needRamUpgrade || needCoreUpgrade)
    && (canAffordLevelUpgrade || canAffordRamUpgrade || canAffordCoreUpgrade)
    && !canAffordNewNode(ns)
  ) {
    const node = hn.getNodeStats(i);
    needLevelUpgrade = node.level < 200;
    needRamUpgrade = node.ram < 64;
    needCoreUpgrade = node.cores < 16;

    const levelUpgradeCost = needLevelUpgrade ? hn.getLevelUpgradeCost(i, upgradeMultiplier) : 0;
    const ramUpgradeCost = needRamUpgrade ? hn.getRamUpgradeCost(i, upgradeMultiplier) : 0;
    const coreUpgradeCost = needCoreUpgrade ? hn.getCoreUpgradeCost(i, upgradeMultiplier) : 0;

    if (!canAffordLevelUpgrade && !canAffordRamUpgrade && !canAffordCoreUpgrade) {
      ns.printf(`WARN Can't afford any upgrades for node ${i}!`);
      return;
    }

    ns.print(`Moneyavailable: $ ${ns.formatNumber(ns.getServerMoneyAvailable('home') * moneyThreshold)}`)
    ns.print(`Node ${i}:`);
    ns.print(`  Level: ${node.level} ${needLevelUpgrade}`);
    ns.print(`  Ram: ${ns.formatRam(node.ram)} ${needRamUpgrade}`);
    ns.print(`  Cores: ${node.cores} ${needCoreUpgrade}`);
    ns.print(`  Production: $ ${ns.formatNumber(node.production)}`);
    ns.print(`  Upgrade Cost: $ ${ns.formatNumber(levelUpgradeCost)}`);
    ns.print(`  Ram Upgrade Cost: $ ${ns.formatNumber(ramUpgradeCost)}`);
    ns.print(`  Core Upgrade Cost: $ ${ns.formatNumber(coreUpgradeCost)}`);

    if (needLevelUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > levelUpgradeCost) {
      hn.upgradeLevel(i, upgradeMultiplier);
    }
    if (needRamUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > ramUpgradeCost) {
      hn.upgradeRam(i, upgradeMultiplier);
    }
    if (needCoreUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > coreUpgradeCost) {
      hn.upgradeCore(i, upgradeMultiplier);
    }

    canAffordLevelUpgrade = needLevelUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > levelUpgradeCost;
    canAffordRamUpgrade = needRamUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > ramUpgradeCost;
    canAffordCoreUpgrade = needCoreUpgrade && ns.getServerMoneyAvailable('home') * moneyThreshold > coreUpgradeCost;

    await ns.sleep(20);
  }
}
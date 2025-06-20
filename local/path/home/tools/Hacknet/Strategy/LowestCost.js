// servers/home/tools/Hacknet/Strategy/LowestCost.ts
function CheapestBuy(hacknet, nodes) {
  const nextNodePurchase = hacknet.getPurchaseNodeCost();
  let cheapestOption = { type: "node", cost: nextNodePurchase };
  for (const node of nodes) {
    if (cheapestOption.cost > node.nextLevelCost) {
      cheapestOption = { type: "level", node, cost: node.nextLevelCost };
    }
    if (cheapestOption.cost > node.nextRamCost) {
      cheapestOption = { type: "ram", node, cost: node.nextRamCost };
    }
    if (cheapestOption.cost > node.nextCoreCost) {
      cheapestOption = { type: "core", node, cost: node.nextCoreCost };
    }
  }
  return cheapestOption;
}
export {
  CheapestBuy
};

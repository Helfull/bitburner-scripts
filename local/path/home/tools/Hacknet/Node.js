// servers/home/tools/Hacknet/Node.ts
var Node = class {
  constructor(hacknet, index, stats) {
    this.hacknet = hacknet;
    this.index = index;
    Object.assign(this, stats);
  }
  get nextRamCost() {
    return this.hacknet.getRamUpgradeCost(this.index);
  }
  get nextCoreCost() {
    return this.hacknet.getCoreUpgradeCost(this.index);
  }
  get nextLevelCost() {
    return this.hacknet.getLevelUpgradeCost(this.index);
  }
};
export {
  Node
};

import { Hacknet, NodeStats } from '@/NetscriptDefinitions';

export interface Node extends NodeStats {}

export class Node {
  constructor(private hacknet: Hacknet, public index: number, stats: NodeStats) {
    Object.assign(this, stats);
  }

  get nextRamCost(): number {
    return this.hacknet.getRamUpgradeCost(this.index);
  }

  get nextCoreCost(): number {
    return this.hacknet.getCoreUpgradeCost(this.index);
  }

  get nextLevelCost(): number {
    return this.hacknet.getLevelUpgradeCost(this.index);
  }
}

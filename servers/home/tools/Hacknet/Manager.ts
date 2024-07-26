import { Hacknet } from '@/NetscriptDefinitions';
import { Node } from '@/servers/home/tools/Hacknet/Node';
import { Option, Purchase, Strategy } from '@/servers/home/tools/Hacknet/Strategy/Strategy';
import { Logger } from '@/servers/home/tools/logger';
import { Color } from '@lib/colors';

export interface Manager extends Hacknet {}

export class Manager {
  public lastPurchase: Purchase;

  constructor(private ns: NS, protected log = new Logger(ns)) {
    Object.assign(this, ns.hacknet);
  }

  protected gatherNodes(): Node[] {
    return Array.from({ length: this.numNodes() }, (_, i) => new Node(this, i, this.getNodeStats(i)));
  }

  get nodes(): Node[] {
    return this.gatherNodes();
  }

  run(strategy: Strategy) {
    const nodes = this.nodes;
    const purchase = strategy(this, nodes);

    if (!this.canAfford(purchase.cost)) {
      return;
    }

    this.lastPurchase = purchase;

    switch (purchase.type) {
      case 'node':
        this.purchaseNode();
        break;
      case 'level':
        this.upgradeNodeLevels(purchase.node);
        break;
      case 'ram':
        this.upgradeNodeRam(purchase.node);
        break;
      case 'core':
        this.upgradeNodeCores(purchase.node);
        break;
    }

    this.log.info(`Purchased ${purchase.type} for ${this.ns.formatNumber(purchase.cost)}`);
  }

  canAfford(cost: number): boolean {
    return this.ns.getServerMoneyAvailable('home') >= cost;
  }

  purchaseNewNode() {
    this.purchaseNode();
  }

  upgradeNodeLevels(node: Node) {
    this.upgradeLevel(node.index);
  }

  upgradeNodeRam(node: Node) {
    this.upgradeRam(node.index);
  }

  upgradeNodeCores(node: Node) {
    this.upgradeCore(node.index);
  }

  toString(): string {
    const out = [`Manager { nodes: ${this.numNodes()}, maxNodes: ${this.maxNumNodes()} }`];

    for (const node of this.nodes) {
      out.push(`${node.name} - [${this.ns.formatNumber(node.totalProduction)}]`);
      out.push(`  ${node.level} (${Color.grey.wrap(this.ns.formatNumber(node.nextLevelCost))})`);
      out.push(`  ${node.ram}GB (${Color.grey.wrap(this.ns.formatNumber(node.nextRamCost))})`);
      out.push(`  ${node.cores} (${Color.grey.wrap(this.ns.formatNumber(node.nextCoreCost))})`);
    }

    return out.join('\n');
  }
}

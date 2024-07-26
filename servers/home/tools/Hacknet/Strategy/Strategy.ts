import { Hacknet } from '@/NetscriptDefinitions';
import { Node } from '@/servers/home/tools/Hacknet/Node';

export type Strategy = (hacknet: Hacknet, nodes: Node[]) => Purchase;

export type Option = 'node' | 'core' | 'level' | 'ram';

export type Purchase = {
  type: Option;
  node?: Node;
  cost: number;
};

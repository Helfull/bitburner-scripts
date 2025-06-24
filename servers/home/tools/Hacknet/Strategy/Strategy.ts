import { Hacknet } from '@/NetscriptDefinitions';
import { Node } from '@/servers/home/tools/Hacknet/Node';
import { Manager } from '@/servers/home/tools/Hacknet/Manager';

export type Strategy = (hacknet: Manager, nodes: Node[]) => Purchase;

export type Option = 'node' | 'core' | 'level' | 'ram';

export type Purchase = {
  type: Option;
  node?: Node;
  cost: number;
  value?: number; // Optional, used for strategies that calculate value
};

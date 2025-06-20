import { defineScript } from '@lib/flags';
import { createServerTree } from '@lib/serverTree';
import { IS_NOT_PRIVATE } from '@/servers/home/server/filter';

export async function main(ns: NS)
{
  const script = defineScript(ns, {
    description: 'Test script',
    flags: {},
    args: {
      target: {
        description: 'Target server to reverse path to',
        defaultValue: 'run4theh111z',
      }
    }
  });

  const tree = createServerTree(ns, (servers: string[]) => servers.filter(IS_NOT_PRIVATE(ns)));

  ns.tprint(tree.reversePathTo(script.args.target).reduce((prev, cur) => prev + ' ;connect ' + cur, ''));
}
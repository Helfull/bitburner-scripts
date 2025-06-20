import { Filters, Sorts } from '@/servers/home/tools/Serverlist/Serverlist';
import { defineScript } from '@lib/flags';

export function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Open the serverlist',
    flags: {
      display: {
        description: 'The display to open the serverlist in',
        defaultValue: 'cli',
        options: ['cli', 'window', 'tab'],
      },
      filter: {
        description: 'Filter servers',
        defaultValue: [],
        options: [],
      },
      sort: {
        description: 'Sort servers by',
        defaultValue: ['ram', 'weight', 'hackable'],
        options: [],
      },
      columns: {
        description: 'Columns to display',
        defaultValue: [],
        options: [],
      },
      servers: {
        description: 'Servers to display',
        defaultValue: [],
      },
    },
  });

  const serverListArgs = {
    sort: args.sort as Sorts[],
    filter: args.filter as Filters[],
    columns: args.columns,
    servers: args.servers,
  };

  const serverListArgsArray: string[] = Object.entries(serverListArgs).reduce((acc, [key, value]) => {
    for (const val of value) {
      acc.push(`--${key}`, val);
    }
    return acc;
  }, []);

  if (args.display === 'cli') {
    ns.run('tools/Serverlist/cli.js', 1, ...serverListArgsArray);
    return;
  } else if (args.display === 'window') {
    ns.run('tools/Serverlist/window.js', 1, ...serverListArgsArray);
    return;
  } else if (args.display === 'tab') {
    ns.run('tools/Serverlist/tab.js', 1, ...serverListArgsArray);
    return;
  }

  ns.run('tools/Serverlist/cli.js');
}

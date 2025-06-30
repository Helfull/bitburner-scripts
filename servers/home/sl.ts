import { Filters, Sorts } from '@/servers/home/tools/Serverlist/Serverlist';
import { defineScript } from '@lib/flags';
import { ScriptArg } from 'NetscriptDefinitions';

export function main(ns: NS) {
  const { args, flags } = defineScript(ns, {
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
    sort: flags.sort as Sorts[],
    filter: flags.filter as Filters[],
    columns: flags.columns,
    servers: flags.servers,
  };

  const serverListArgsArray: ScriptArg[] = Object.entries(serverListArgs)
    .reduce((acc, [key, value]) => {
      for (const val of value) {
        acc.push(`--${key}`, val);
      }
      return acc;
    }, [] as ScriptArg[]);

  if (flags.display === 'cli') {
    ns.run('tools/Serverlist/cli.js', 1, ...serverListArgsArray);
    return;
  } else if (flags.display === 'window') {
    ns.run('tools/Serverlist/window.js', 1, ...serverListArgsArray);
    return;
  } else if (flags.display === 'tab') {
    ns.run('tools/Serverlist/tab.js', 1, ...serverListArgsArray);
    return;
  }

  ns.run('tools/Serverlist/cli.js');
}

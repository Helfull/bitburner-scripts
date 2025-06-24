import { printTableObj } from '@lib/table';
import { bool, progressBar } from '@lib/utils';
import { Color } from '@lib/colors';
import { COLUMNS, Columns, FILTERS, Filters, PercentStats, SORTS, Sorts, StringRows, serverList } from './Serverlist';
import { defineScript } from '@lib/flags';

const cliFormatMap: {
  [key in Columns | 'default']?: (value: any, col?: string, serverName?: string, ns?: NS) => string;
} = {
  money: (value: PercentStats, _, __, ns: NS) => progressBar(ns, value.current, value.max),
  usedRamPercent: (value: PercentStats, _, __, ns: NS) => progressBar(ns, value.current, value.max),
  secLevel: (value: PercentStats, _, __, ns: NS) =>
    progressBar(ns, value.max, value.current, Math.abs(1 - value.percent), { text: true, reverse: true }),
  rootAccess: (value) => bool(value),
  protoStatus: (value) => bool(value),
  prepStatus: (value) => bool(value),
  backdoorInstalled: (value) => bool(value),
  hackable: (value) => bool(value),

  status: (value) =>
    ({
      READY: Color.white.greenBG.wrap(value),
      OKAY: Color.white.greenBG.wrap(value),
      WARN: Color.white.yellowBG.wrap(value),
      ERROR: Color.white.redBG.wrap(value),
      UNKNOWN: value,
    }[value]),

  default: (value) => (value === undefined ? '' : value),
};

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'List all servers',
    flags: {
      sort: {
        description: 'Sort servers by',
        defaultValue: ['ram', 'weight', 'hackable'],
        options: SORTS,
      },
      columns: {
        description: 'Columns to display',
        defaultValue: COLUMNS,
        options: COLUMNS,
      },
      filter: {
        description: 'Filter servers',
        defaultValue: [],
        options: FILTERS,
      },
      servers: {
        description: 'Servers to display',
        defaultValue: [],
      },
      refresh: {
        description: 'Refresh the list',
        defaultValue: false,
        options: [],
      },
      refreshrate: {
        description: 'Refresh rate in ms',
        defaultValue: 10000,
        options: [],
      },
    },
  });

  ns.ui.moveTail(60, 0);

  do {
    ns.clearLog();

    const mappedServerTable = serverList(ns, {
      sort: args.sort as Sorts[],
      filter: args.filter as Filters[],
      servers: args.servers,
      markup: true,
    });

    const mappedRows = mappedServerTable.rows.map((row) => {
      return args.columns.reduce((acc, col) => {
        const field = cliFormatMap[col] || cliFormatMap.default;
        acc[col] = field(row.data[col], col, row.server, ns);
        return acc;
      }, {} as StringRows);
    });

    printTableObj(ns, mappedRows, ns.tprint);
  } while (args.refresh && (await ns.sleep(args.refreshrate as number)));
}

import { getServers, weight } from '@lib/utils';
import { HAS_MONEY, IS_HACKABLE, IS_NOT_HOME, IS_NOT_PRIVATE } from '../../server/filter';
import { BY_HACKABLE, BY_MAX_RAM, BY_RAM_USAGE, BY_WEIGHT } from '../../server/sort';

const FILTERS_MAP = {
  hackable: IS_HACKABLE,
  money: HAS_MONEY,
  nothome: IS_NOT_HOME,
  notprivate: IS_NOT_PRIVATE,
};

export const FILTERS = Object.keys(FILTERS_MAP);

const SORTS_MAP = {
  ram: BY_RAM_USAGE,
  maxRam: BY_MAX_RAM,
  weight: BY_WEIGHT,
  hackable: BY_HACKABLE,
};

export const SORTS = Object.keys(SORTS_MAP);

const Tuple = <T extends any[]>(xs: readonly [...T]): T => xs as T;

export const COLUMNS = Tuple([
  'index',
  'status',
  'name',
  'money',
  'maxRam',
  'usedRam',
  'usedRamPercent',
  'secLevel',
  'rootAccess',
  'backdoorInstalled',
  'hackable',
  'hackSkill',
  'hackTime',
  'wknTime',
  'growTime',
  'weight',
  'protoStatus',
  'prepStatus',
] as const);

export type Columns = (typeof COLUMNS)[number];
export type Sorts = keyof typeof SORTS_MAP;
export type Filters = keyof typeof FILTERS_MAP;

export type ServerListArgs = {
  sort?: Sorts[];
  columns?: Columns[];
  filter?: Filters[];
  servers?: string[];
  markup?: boolean;
};

export type PercentStats = {
  current: number;
  max: number;
  percent: number;
};

export type TypedColumns = {
  money: PercentStats;
  secLevel: PercentStats;
  usedRamPercent: PercentStats;
  rootAccess: boolean;
  backdoorInstalled: boolean;
  hackable: boolean;
  protoStatus: boolean;
  prepStatus: boolean;
};

export type StringRows = {
  [key in Columns]: string;
};

export type ServerlistRow = {
  server: string;
  data: ServerlistRowData;
};
type ServerlistRowData = Omit<StringRows, keyof TypedColumns> & TypedColumns;

export type ServerlistRowPrep = {
  server: string;
  data: {
    [key in keyof ServerlistRowData]: () => ServerlistRowData[key];
  };
};

export type Serverlist = {
  args: ServerListArgs;
  rows: ServerlistRow[];
};

export type ServerStatus = 'OKAY' | 'WARN' | 'ERROR' | 'READY' | 'PREP' | 'UNKNOWN';

function percentField(min, max) {
  return (): PercentStats => ({ current: min, max: max, percent: min / max || 0 });
}

export function serverList(ns: NS, args?: ServerListArgs): Serverlist {
  args = {
    sort: ['weight'],
    columns: [...COLUMNS],
    filter: ['hackable', 'money', 'nothome', 'notprivate'],
    servers: [],
    markup: false,
    ...args,
  };

  const servers = getServers(ns);

  const total = {
    maxRam: 0,
    usedRam: 0,
    minSecLevel: 0,
    secLevel: 0,
    curMoney: 0,
    maxMoney: 0,
  };

  let serversTable = servers.map((server) => ns.getServer(server));

  if (args.servers.filter((server) => server.length > 0).length > 0) {
    serversTable = serversTable.filter((server) => {
      for (const filter of args.servers) {
        if (server.hostname.includes(filter)) {
          return true;
        }
      }

      return false;
    });
  }

  for (const filter of args.filter) {
    if (FILTERS_MAP[filter]) {
      serversTable = serversTable.filter(FILTERS_MAP[filter](ns));
    }
  }

  for (const sort of args.sort) {
    if (SORTS_MAP[sort]) {
      serversTable = serversTable.sort(SORTS_MAP[sort](ns));
    }
  }

  const mappedServerTable = serversTable.map((server, i): ServerlistRowPrep => {
    total.maxRam += server.maxRam;
    total.usedRam += server.ramUsed;
    total.secLevel += server.hackDifficulty;
    total.minSecLevel += server.minDifficulty;
    total.curMoney += server.moneyAvailable;
    total.maxMoney += server.moneyMax;
    const protoStatus = () => ns.getRunningScript('proto-batch.js', 'home', server.hostname) !== null;
    const prepStatus = () => ns.getRunningScript('prep.js', 'home', server.hostname) !== null;
    const data: ServerlistRowPrep['data'] = {
      index: () => i.toString(),
      status: () => {
        const isMaxedMoney = server.moneyAvailable === server.moneyMax;
        const isMinSecLevel = server.hackDifficulty === server.minDifficulty;
        const isPrepped = isMaxedMoney && isMinSecLevel;
        const isRunningProto = protoStatus();
        const isRunningPrep = prepStatus();
        let status = 'UNKNOWN';

        if (isPrepped && !isRunningProto) {
          status = 'READY';
        }

        if (isMaxedMoney && isMinSecLevel && isRunningProto) {
          status = 'OKAY';
        }

        if (!isPrepped && !isRunningPrep) {
          status = 'WARN';
        }

        if (!isPrepped && isRunningProto) {
          status = 'ERROR';
        }

        if (isRunningPrep) {
          status = 'PREP';
        }

        return status;
      },
      weight: () => ns.formatNumber(weight(ns, server.hostname)),
      name: () => server.hostname,
      money: percentField(server.moneyAvailable, server.moneyMax),
      maxRam: () => ns.formatRam(server.maxRam, 0),
      usedRam: () => ns.formatRam(server.ramUsed),
      usedRamPercent: percentField(server.ramUsed, server.maxRam),
      secLevel: percentField(server.hackDifficulty, server.minDifficulty),
      rootAccess: () => server.hasAdminRights,
      backdoorInstalled: () => server.backdoorInstalled || false,
      hackable: () => (server.requiredHackingSkill || 0) <= ns.getHackingLevel(),
      hackSkill: () => ns.sprintf('%d', server.requiredHackingSkill || 0),
      hackTime: () => ns.formatNumber(ns.getHackTime(server.hostname) / 1000, 0),
      wknTime: () => ns.formatNumber(ns.getWeakenTime(server.hostname) / 1000, 0),
      growTime: () => ns.formatNumber(ns.getGrowTime(server.hostname) / 1000, 0),
      protoStatus,
      prepStatus,
    };

    return {
      data,
      server: server.hostname,
    };
  });

  mappedServerTable.unshift({
    server: 'Total',
    data: {
      ...args.columns.reduce((acc, col) => ({ ...acc, [col]: () => '' }), {}),
      name: () => 'Total',
      maxRam: () => ns.formatRam(total.maxRam, 0),
      usedRam: () => ns.formatRam(total.usedRam),
      usedRamPercent: percentField(total.usedRam, total.maxRam),
      secLevel: percentField(total.minSecLevel, total.secLevel),
      money: percentField(total.curMoney, total.maxMoney),
    } as ServerlistRowPrep['data'],
  });

  return {
    args,
    rows: mappedServerTable.map((row: ServerlistRowPrep) => ({
      server: row.server,
      data: args.columns.reduce((acc: ServerlistRowData, col: Columns) => {
        /** @ts-ignore */
        acc[col] = row.data[col]();
        return acc;
      }, {} as ServerlistRowData),
    })),
  };
}

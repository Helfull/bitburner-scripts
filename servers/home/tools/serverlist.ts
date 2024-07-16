import { ScriptArg } from "../../../NetscriptDefinitions";
import { bool, getServers, printTableObj, progressBar, setupDefault, weight } from "../cnc/lib";
import { HAS_MONEY, IS_HACKABLE, IS_NOT_HOME, IS_NOT_PRIVATE } from "../server/filter";
import { BY_HACKABLE, BY_RAM_USAGE_PERCENTAGE, BY_WEIGHT } from "../server/sort";

const FILTERS = {
  hackable: IS_HACKABLE,
  money: HAS_MONEY,
  nothome: IS_NOT_HOME,
  notprivate: IS_NOT_PRIVATE,
};

const SORTS = {
  ram: BY_RAM_USAGE_PERCENTAGE,
  weight: BY_WEIGHT,
  hackable: BY_HACKABLE,
};

const COLUMNS = [
  'index',
  'weight',
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
  'protoStatus',
];

export function serverList(ns: NS, args: { [key: string]: ScriptArg | string[] }) {

  const servers = getServers(ns);

  const total = {
    maxRam: 0,
    usedRam: 0,
  };

  let serversTable = servers
    .map(server => ns.getServer(server));

  if (args.servers.length) {
    serversTable = serversTable.filter(server => (args.servers as string[]).includes(server.hostname));
  }

  for (const filter of args.filter) {
    if (FILTERS[filter]) {
      serversTable = serversTable.filter(FILTERS[filter](ns));
    }
  }

  for (const sort of args.sort) {
    if (SORTS[sort]) {
      serversTable.sort(SORTS[sort](ns));
    }
  }

  const mappedServerTable = serversTable.map((server, i) => {
    total.maxRam += server.maxRam;
    total.usedRam += server.ramUsed;
    return {
      index: () => i.toString(),
      weight: () => ns.formatNumber(weight(ns, server.hostname)),
      name: () => server.hostname,
      money: () => progressBar(ns, server.moneyAvailable, server.moneyMax, { width: 10, text: true, formatter: ns.formatNumber }),
      maxRam: () => ns.formatRam(server.maxRam, 0),
      usedRam: () => ns.formatRam(server.ramUsed),
      usedRamPercent: () => progressBar(ns, server.ramUsed, server.maxRam),
      secLevel: () => ns.sprintf(
        '%s / %s (%s)',
        Math.round(ns.getServerSecurityLevel(server.hostname)),
        ns.getServerMinSecurityLevel(server.hostname),
        ns.formatPercent(ns.getServerSecurityLevel(server.hostname) / ns.getServerMinSecurityLevel(server.hostname)),
      ),
      rootAccess: () => bool(server.hasAdminRights),
      backdoorInstalled: () => bool(server.backdoorInstalled || false),
      hackable: () => bool((server.requiredHackingSkill || 0) <= ns.getHackingLevel()),
      hackSkill: () => ns.sprintf('%d', server.requiredHackingSkill || 0),
      hackTime: () => ns.formatNumber(ns.getHackTime(server.hostname) / 1000, 0),
      wknTime: () => ns.formatNumber(ns.getWeakenTime(server.hostname) / 1000, 0),
      growTime: () => ns.formatNumber(ns.getGrowTime(server.hostname) / 1000, 0),
      protoStatus: () => ns.getRunningScript('cnc/proto-batch.js', 'home', server.hostname) !== null ? 'Running' : 'Stopped',
    };
  });

  // add divider
  mappedServerTable.push(args.columns.reduce((acc, col) => {
    acc[col] = () => '============';
    return acc;
  }, {}));

  mappedServerTable.push({
    ...args.columns.reduce((acc, col) => ({...acc, [col]: () => ''}), {}),
    name: () => 'Total',
    maxRam: () => ns.formatRam(total.maxRam, 0),
    usedRam: () => ns.formatRam(total.usedRam),
    usedRamPercent: () => progressBar(ns, total.usedRam, total.maxRam),
  });

  return mappedServerTable.map(row => args.columns.reduce((acc, col) => {
    acc[col] = row[col]();
    return acc;
  }, {}));
}

export async function main(ns: NS) {

  const args = setupDefault(ns, [
    ['sort', ['ram', 'weight', 'hackable']],
    ['columns', COLUMNS],
    ['filter', ['hackable', 'money', 'nothome', 'notprivate']],
    ['servers', []],
    ['refresh', false],
    ['refreshrate', 10000],
  ]);

  ns.moveTail(60, 0);

  do {
    ns.clearLog();

    const mappedServerTable = serverList(ns, args);

    printTableObj(ns, mappedServerTable, args.tail ? ns.tprint : ns.print);
  } while(args.refresh && await ns.sleep(args.refreshrate as number));
}

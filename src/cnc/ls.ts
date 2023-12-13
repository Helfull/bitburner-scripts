import { NS } from '@ns';
import { getServers, printTable, weight } from 'cnc/lib';
import { hackablePortCount } from 'scripts/lib';
import * as colors from 'cli-colors';
import { _ } from 'cli-colors';
import { getRunningScripts, hasFilter, needsPrepping } from 'lib/utils';
import { checkmark, progressBar } from 'lib/str';

export async function main(ns: NS) {
  const flags = ns.flags([
    ['find', '.*'],
    ['n', -1],
    ['files', false],
    ['verbose', false],
    ['weights', false],
    ['loop', false],
    ['windowed', false],
    ['filters', []],
  ]);

  ns.tprintf('INFO | %s', JSON.stringify(flags));

  do {
    printServers(flags, ns);
    await ns.sleep(5000);
  } while (flags.loop)
}

function printServers(flags: ReturnType<typeof ns.flags>, ns: NS) {
  const targetting = getTargettingArgs(ns);
  const prepping = getTargettingArgs(ns, 'prep.js');
  const servers = getServers(ns)
    .map(s => {
      const sData = ns.getServer(s);
      return ({
        hostname: s,
        maxRam: ns.getServerMaxRam(s),
        usedRam: ns.getServerUsedRam(s),
        maxMoney: ns.getServerMaxMoney(s),
        money: ns.getServerMoneyAvailable(s),
        minSecurity: ns.getServerMinSecurityLevel(s),
        security: ns.getServerSecurityLevel(s),
        root: sData.hasAdminRights,
        backdoor: sData.backdoorInstalled,
        files: ns.ls(s).filter(f => !f.endsWith('.js')),
        ports: ns.getServerNumPortsRequired(s),
        weight: weight(ns, s),
        hLvl: ns.getServerRequiredHackingLevel(s),
        hckTime: ns.getHackTime(s),
        grwTime: ns.getGrowTime(s),
        wknTime: ns.getWeakenTime(s),
        needsPrepping: needsPrepping(ns, s),
        isPrepping: prepping.includes(s),
        isTargetted: targetting.includes(s),
      })
    })
    .sort((a, b) => b.maxMoney - a.maxMoney)
    .sort((a, b) => b.weight - a.weight)
    .filter(s => new RegExp(flags.find as string).test(s.hostname))
    .filter(s => hasFilter(flags, 'hasMoney', s.maxMoney > 0))
    .filter(s => hasFilter(flags, 'needsPrepping', s.needsPrepping))
    .filter(s => hasFilter(flags, 'prepping', s.isPrepping))
    .filter(s => hasFilter(flags, 'targetted', s.isTargetted))
    .filter(s => hasFilter(flags, 'prepped', (s.money >= s.maxMoney && s.security <= s.minSecurity && s.maxMoney > 0)))
    .slice(0, (flags.n as number) > 0 ? (flags.n as number) : undefined)
    .reduce((acc, cur) => {
      acc.hostname.push(cur.hostname);
      acc.ram.push(_(cur.usedRam < cur.maxRam * 0.9 ? colors.FDARKRED: colors.FGREEN, progressBar(cur.usedRam, cur.maxRam)));
      acc.money.push(_(cur.money < cur.maxMoney ? colors.FDARKRED: colors.FGREEN, progressBar(cur.money, cur.maxMoney)));

      acc.security.push(_(cur.security > cur.minSecurity ? colors.FDARKRED: colors.FGREEN, progressBar(cur.minSecurity, cur.security)));

      acc.root.push(_(cur.root ? colors.FGREEN : colors.FDARKRED, checkmark(cur.root)));
      acc.needsPrepping.push(_(cur.needsPrepping ? colors.FRED : colors.FDARKRED, checkmark(cur.needsPrepping)));
      acc.isPrepping.push(_(cur.isPrepping ? colors.FGREEN : colors.FDARKRED, checkmark(cur.isPrepping)));
      acc.isTargetted.push(_(cur.isTargetted ? colors.FGREEN : colors.FDARKRED, checkmark(cur.isTargetted)));
      acc.backdoor.push(_(cur.backdoor ? colors.FGREEN : colors.FDARKRED, checkmark(cur.backdoor || false)));

      acc.ports.push(_(hackablePortCount(ns) < cur.ports ? colors.FDARKRED: colors.FGREEN, cur.ports.toString()));
      acc.hlvl.push(_(cur.hLvl > ns.getHackingLevel() ? colors.FDARKRED: colors.FGREEN, cur.hLvl.toString()));
      acc.weights.push(cur.weight.toFixed(2));
      acc.hckTime.push(ns.tFormat(cur.hckTime));
      acc.grwTime.push(ns.tFormat(cur.grwTime));
      acc.wknTime.push(ns.tFormat(cur.wknTime));
      acc.files.push(cur.files.join(', '));
      return acc;
    }, {
      hostname: [] as string[],
      ram: [] as string[],
      money: [] as string[],
      security: [] as string[],
      root: [] as string[],
      backdoor: [] as string[],
      ports: [] as string[],
      hlvl: [] as string[],
      weights: [] as string[],
      files: [] as string[],
      hckTime: [] as string[],
      grwTime: [] as string[],
      wknTime: [] as string[],
      needsPrepping: [] as string[],
      isPrepping: [] as string[],
      isTargetted: [] as string[],
    });

  if (! flags.files) {
    delete servers.files;
  }

  if (! flags.verbose) {
    delete servers.hckTime;
    delete servers.grwTime;
    delete servers.wknTime;
  }


  if (! flags.weights) {
    delete servers.weights;
  }

  if (flags.windowed) {
    ns.disableLog('ALL');
    ns.clearLog();
    ns.print(printTable(servers));
  } else {
    ns.tprint(printTable(servers));
  }
}

function getTargettingArgs(ns: NS, script = 't.js') {
  return getRunningScripts(ns, 'home', script).map(p => p.args[0]);
}
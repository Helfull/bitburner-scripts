import { _ } from 'cli-colors.js';
import * as colors from 'cli-colors.js';
import { NS } from '@ns';
import { getServers, pServerPrefix } from './cnc/lib';

const allowedActions = [
  'target', 'fill', 'spread', 'run', 'cfg', 'upgrade', 'kill'
];

export type Settings = {
  ['_']: string[],
  action: string,
  on: string,
  target: string[],
  exclude: string[],
  script: string,
  sweaken: string,
  sgrow: string,
  shack: string,
  wknRatio: number,
  grwRatio: number,
  hckRatio: number,
  startram: number,
  verbose: boolean
  ['no-store']?: boolean
}

type SettingKeys = keyof Settings;

export async function main(ns: NS) {

  let storedSettings: Settings = {
    '_': [],
    action: '',
    on: 'all',
    target: ['joesguns'],
    exclude: ['home'],
    script: 'scripts/f.js',
    sweaken: 'scripts/weaken.js',
    sgrow: 'scripts/grow.js',
    shack: 'scripts/hack.js',
    wknRatio: 1,
    grwRatio: 10,
    hckRatio: 2,
    startram: 256,
    verbose: false
  };

  if (ns.fileExists(`cnc/${ns.args[0]}.js`, 'home') && !allowedActions.includes(ns.args[0] as string)) {
    ns.tprintf('INFO | Running %s', `cnc/${ns.args[0]}.js`)
    ns.exec(`cnc/${ns.args[0]}.js`, 'home', 1, ...ns.args.slice(1));
    return;
  }

  if (ns.fileExists('cnc.store.txt')) {
    storedSettings = {...storedSettings, ...JSON.parse(ns.read('cnc.store.txt'))};
  }

  const settings: Settings = ns.flags([
    ['action', 'target'],
    ['on', storedSettings.on],
    ['target', storedSettings.target],
    ['exclude', storedSettings.exclude],
    ['script', storedSettings.script],
    ['sweaken', storedSettings.sweaken],
    ['sgrow', storedSettings.sgrow],
    ['shack', storedSettings.shack],
    ['wknRatio', storedSettings.wknRatio],
    ['grwRatio', storedSettings.grwRatio],
    ['hckRatio', storedSettings.hckRatio],
    ['startram', storedSettings.startram],
    ['verbose', storedSettings.verbose],
    ['no-store', false]
  ]) as Settings;

  const action = settings['_'][0] || settings.action

  if (!allowedActions.includes(action)) return;

  if (settings['no-store'] == false) {
    ns.write('cnc.store.txt', JSON.stringify(settings), 'w');
  }

  ns.print(settings);

  switch(action) {
    case 'kill': {
      getServers(ns)
        .filter(s => s.startsWith('pserv-'))
        .forEach((s) => ns.killall(s));
      return;
    }
    case 'cfg':
      return actionCfg(ns, settings);
    case 'upgrade':
      return actionUpgrade(ns, settings['_'][1]);
    case 'fill':
      return actionFill(ns, settings);
  }

  let pservers = ns.scan();

  for (let i=0; i<pservers.length; i++) {
    const neighbors = ns.scan(pservers[i]);

    for (const neighbor of neighbors) {
      if (pservers.includes(neighbor)) continue;
      if (neighbor == 'home') continue;
      pservers.push(neighbor)
    }
  }

  pservers = pservers
    .filter((s) => !settings.exclude.includes(s));

  if (settings.on != 'all') {
    await runAction(ns, action, settings.on, settings);
    return;
  }

  ns.print(pservers)

  for (const slave of pservers) {
    if (slave == 'pserv-preWeaken') continue;
    await runAction(ns, action, slave, settings);
    await ns.asleep(100)
  }

}

async function runAction(ns: NS, action:string, slave:string, settings: Settings) {
  ns.print(' ')
  ns.printf(_(colors.FWHITE,'Server: %s'), slave)
  ns.printf(_(colors.FWHITE,'Action: %s') , action)
  ns.printf(_(colors.FWHITE,'Settings: \n%s'), JSON.stringify(settings))

  switch(action) {
    case 'spread': await actionSpread(ns, slave); break;
    case 'target': await actionTarget(ns, slave, settings); break;
    case 'run': await actionRun(ns, slave, settings); break;
  }
}

async function actionCfg(ns: NS, settings: Settings) {
  switch(settings['_'][1]) {
    case 'set': {
      if (settings['_'].length < 4) return;
      const key: SettingKeys = settings['_'][2] as SettingKeys;
      const value = settings['_'][3];
      // @ts-ignore
      settings[key] = value;
      break;
    }
    case 'add-target': {
      const toAdd: string[] = settings['_'].slice(2);
      settings.target.push(...toAdd)
      settings.target = settings.target.filter((v, i, a) => a.indexOf(v) === i);
      ns.toast(ns.sprintf('Added CNC target %s', toAdd.join(' ')), 'success')
      break;
    }
    case 'clear-targets':
        settings.target = [];
        ns.toast('Cleared CNC targets', 'success')
      break;
    case 'exclude': {
      const toExclude: string[] = settings['_'].slice(2);
      settings.exclude.push(...toExclude)
      settings.exclude = settings.exclude.filter((v, i, a) => a.indexOf(v) === i);
      ns.toast(ns.sprintf('Added CNC exclude %s', toExclude.join(' ')), 'success')
      break;
    }
    case 'clear-excludes':
        settings.target = ['home'];
        ns.toast('Cleared CNC excludes', 'success')
      break;
    default:
      ns.tprint(JSON.stringify(settings, null, 2));
  }

  if (settings['no-store']) return;

  ns.write('cnc.store.txt', JSON.stringify(settings), 'w');
  return;
}

async function actionSpread(ns: NS, slave: string) {
  ns.exec('cnc/spread.js', ns.getHostname(), 1, slave);
}

async function actionFill(ns: NS, settings: Settings) {
  ns.exec('cnc/fill.js', ns.getHostname(), 1, JSON.stringify(settings).replace("'", '"'));
}

function actionUpgrade(ns: NS, slave: string) {
    if (! slave.startsWith(pServerPrefix)) return;
    const currentRam = ns.getServerMaxRam(slave);

    const options = [];

    for (let i = 1; i < 20; i++) {
      if (Math.pow(2, i) <= currentRam) continue
      options.push(
        ns.sprintf('%s -> %s',
          ns.formatRam(Math.pow(2, i)).padStart(10),
          ns.formatNumber(ns.getPurchasedServerUpgradeCost(slave, Math.pow(2, i))).toString().padStart(10)
        )
      )
    }

    ns.prompt('Upgrade Ram', {
      type: 'select',
      choices: options
    })

    //const upgradeCost = ns.getPurchasedServerUpgradeCost(slave, settings['_'][2])
    //ns.tprint(ns.formatNumber(upgradeCost))
    //const playerMoney = ns.getServerMoneyAvailable('home')
    //if (playerMoney > upgradeCost) {
    //  ns.upgradePurchasedServer(slave, settings['_'][2])
    //}
}

async function actionTarget(ns: NS, slave: string, settings: Settings) {
  ns.exec('cnc/spread.js', ns.getHostname(), 1, slave);
  await ns.asleep(100)
  ns.exec('cnc/target.js', ns.getHostname(), 1, slave, JSON.stringify(settings).replace("'", '"'));
  await ns.sleep(100)
}

function actionRun(ns: NS, slave: string, settings: Settings) {
  ns.exec('cnc/spread.js', ns.getHostname(), 1, slave);
  ns.exec('cnc/run.js', ns.getHostname(), 1, slave, JSON.stringify(settings).replace("'", '"'));
}


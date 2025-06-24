import { Color } from '@lib/colors';
import { ScriptArg } from '../../../NetscriptDefinitions';
import { config } from '../config';

export type Schema = [string, string | number | boolean | string[]][];
export type Options = {
  disable: ('ALL' | keyof NS)[]
}
export function setupDefault(ns: NS, schema?: Schema, options: Options = {
  disable: ['ALL']
}) {
  const args = flags(ns, schema);

  for(let disable of options.disable) {
    ns.disableLog(disable);
  }

  setupTail(ns, args);

  return args;
}

export function flags(ns: NS, schema?: Schema) {
  return ns.flags([['tail', false], ...(schema || [])]);
}

export function setupTail(ns: NS, args: { [key: string]: ScriptArg | string[] }) {
  if (args.tail) {
    ns.tprintRaw(`Tailing logs`);
    ns.ui.openTail();
  }
}

export function killOldScript(ns: NS, scriptName: string, server: string) {
  if (!ns.scriptRunning(scriptName, server)) {
    return;
  }

  const script = ns.getRunningScript(scriptName, server);

  if (script === null) {
    return;
  }

  if (script.pid !== ns.pid) {
    ns.tprint(`Script already running`);
    ns.tprint(`PID: ${script.pid}`);
    ns.tprint(`Threads: ${script.threads}`);
    ns.tprint(`Killing old script`);
    ns.kill(script.pid);
  }
}

export function bool(bool: boolean): string {
  return bool ? Color.green.wrap('Yes') : Color.red.wrap('No');
}

export function boolBG(bool: boolean): string {
  return bool ? Color.greenBG.black.wrap('Yes') : Color.redBG.white.wrap(' No');
}

type ProgressOptions = {
  width?: number;
  text?: boolean;
  formatter?: (v: number) => string;
  reverse?: boolean;
};

export function progressBar(
  ns: NS,
  current: number,
  max: number,
  percent?: number,
  options: ProgressOptions = { width: 20, text: false },
) {
  options.width = options.width || 20;
  options.text = options.text ?? false;
  options.formatter = options.formatter || ns.formatNumber;
  options.reverse = options.reverse || false;
  percent = percent !== undefined ? percent : current / max;
  if (isNaN(percent)) percent = 0;

  const fillColor = options.reverse ? 'red' : 'green';
  const emptyColor = options.reverse ? 'green' : 'red';

  let barWidth = Math.floor(options.width * Math.min(1, percent));

  const leftBar = Color[fillColor].wrap(['\uEE04'.repeat(Math.max(0, barWidth))].join(''));
  const rightBar = Color[emptyColor].wrap(['\uEE01'.repeat(Math.max(0, options.width - barWidth))].join(''));

  const startCap = percent > 0 ? Color[fillColor].wrap('\uEE03') : Color[emptyColor].wrap('\uEE00');
  const endCap = percent >= 1 ? Color[fillColor].wrap('\uEE05') : Color[emptyColor].wrap('\uEE02');
  const bar = `${startCap}${leftBar}${rightBar}${endCap}`;

  if (options.text === false) return `${bar}`;
  return `${options.formatter(current || 0)}/${options.formatter(max || 0)} (${ns.sprintf(
    '%.2f%%',
    percent * 100,
  )}) ${bar}`;
}

export function stripColors(str: string): string {
  return Color.unwrap(str);
}

export const pServerPrefix = config.prefixPrivate;

export function settingsArg(ns: NS) {
  return JSON.parse((ns.args[1] as string).replace("'", '"'));
}

export function getServers(ns: NS): string[] {
  const servers = ns.scan();

  for (let i = 0; i < servers.length; i++) {
    const neighbors = ns.scan(servers[i]);

    for (const neighbor of neighbors) {
      if (servers.includes(neighbor)) continue;
      servers.push(neighbor);
    }
  }

  return servers;
}

// Returns a weight that can be used to sort servers by hack desirability
export function weight(ns: NS, server: string) {
  if (!server) return 0;

  // Don't ask, endgame stuff
  if (server.startsWith('hacknet-node')) return 0;

  // Get the player information
  const player = ns.getPlayer();

  // Get the server information
  const so = ns.getServer(server);

  // Set security to minimum on the server object (for Formula.exe functions)
  so.hackDifficulty = so.minDifficulty;

  // We cannot hack a server that has more than our hacking skill so these have no value
  if ((so.requiredHackingSkill || 0) > player.skills.hacking) return 0;

  // Default pre-Formulas.exe weight. minDifficulty directly affects times, so it substitutes for min security times
  let weight = (so.moneyMax || 0) / (so.minDifficulty || 1);

  // If we have formulas, we can refine the weight calculation
  if (ns.fileExists('Formulas.exe')) {
    // We use weakenTime instead of minDifficulty since we got access to it,
    // and we add hackChance to the mix (pre-formulas.exe hack chance formula is based on current security, which is useless)
    weight =
      ((so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player)) * ns.formulas.hacking.hackChance(so, player);
  }
  // If we do not have formulas, we can't properly factor in hackchance, so we lower the hacking level tolerance by half
  else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2) return 0;

  return weight;
}

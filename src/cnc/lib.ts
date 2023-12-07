import { NS } from '@ns';
import { stripColors } from 'cli-colors';

export const pServerPrefix = 'pserv-';

export function settingsArg(ns: NS) {
  return JSON.parse((ns.args[1] as string).replace("'", '"'))
}

export function getServers(ns: NS): string[] {
  const servers = ns.scan();

  for (let i=0; i<servers.length; i++) {
    const neighbors = ns.scan(servers[i]);

    for (const neighbor of neighbors) {
      if (servers.includes(neighbor)) continue;
      servers.push(neighbor)
    }
  }

  return servers;
}

export function printTable(ns: NS, table: { [key: string]: any[] }) {
  const header = Object.keys(table);
  const cols = Object.values(table)
    .map(col => col.map(v => v?.toString() || ''));
  const rows = cols[0]
    .map((_, i) => cols.map(col => col[i]));

  const colWidths = header.map((columnHeader, i) => {
    return Math.max(stripColors(columnHeader).length, ...cols[i]?.map(v => stripColors(v || '').length) || []);
  });

  ns.tprint([
    '',
    header.map((v, i) => v.padStart(colWidths[i], ' ')).join(' | '),
    header.map((_, i) => ''.padStart(colWidths[i], '-')).join(' | '),
    rows.map(row =>
      row
        .map((v, i) => ''.padStart(colWidths[i] - stripColors(v || '').length, ' ') + v)
        .join(' | ')
    ).join('\n'),
  ].join('\n'));
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
      weight = (so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
  }
  else
      // If we do not have formulas, we can't properly factor in hackchance, so we lower the hacking level tolerance by half
      if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2)
          return 0;

  return weight;
}
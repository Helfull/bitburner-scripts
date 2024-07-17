import { ScriptArg } from "../../../NetscriptDefinitions";
import { Color } from "../colors";
import { config } from "../config";

export type Schema = [string, string | number | boolean | string[]][];

export function setupDefault(ns: NS, schema?: Schema) {
  const args = flags(ns, schema);
  ns.disableLog("ALL");
  setupTail(ns, args);

  return args;
}

export function flags(ns: NS, schema?: Schema) {
  return ns.flags([["tail", false], ...(schema || [])]);
}

export function setupTail(
  ns: NS,
  args: { [key: string]: ScriptArg | string[] }
) {
  if (args.tail) {
    ns.tprintRaw(`Tailing lsogs`);
    ns.tail();
  }
}

export function killOldScript(ns: NS, scriptName: string, server: string) {
  if (!ns.scriptRunning(scriptName, server)) {
    return;
  }

  const script = ns.getRunningScript(scriptName, server);

  if (script === null) {
    ns.tprint(`Failed to get running script`);
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
  return bool ? Color.green.wrap("Yes") : Color.red.wrap("No");
}

export function boolBG(bool: boolean): string {
  return bool ? Color.greenBG.black.wrap("Yes") : Color.redBG.white.wrap(" No");
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
  options: ProgressOptions = { width: 20, text: false }
) {
  options.width = options.width || 20;
  options.text = options.text ?? false;
  options.formatter = options.formatter || ns.formatNumber;
  options.reverse = options.reverse || false;
  const percent = current / max;
  let barWidth = Math.floor(options.width * percent);

  const leftColor = options.reverse ? Color.red : Color.green;
  const leftBar = leftColor.wrap(["\uEE04".repeat(barWidth)].join(""));
  const rightColor = options.reverse ? Color.green : Color.red;
  const rightBar = rightColor.wrap(
    ["\uEE01".repeat(options.width - barWidth)].join("")
  );

  const startCap =
    percent > 0 ? Color.green.wrap("\uEE03") : Color.red.wrap("\uEE00");
  const endCap =
    percent >= 1 ? Color.green.wrap("\uEE05") : Color.red.wrap("\uEE02");
  const bar = `${startCap}${leftBar}${rightBar}${endCap}`;

  if (options.text === false) return `${bar}`;
  return `${options.formatter(current)}/${options.formatter(max)} (${ns.sprintf(
    "%.2f%%",
    percent * 100
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

export function printTableObj(
  ns: NS,
  tableRows: { [key: string]: any }[],
  output = ns.tprint
) {
  if (tableRows.length === 0) return;

  const table = {};

  for (const row of tableRows) {
    for (const key in row) {
      if (!table[key]) table[key] = [];
      table[key].push(row[key]);
    }
  }

  printTable(ns, table, output);
}

export function printTable(
  ns: NS,
  table: { [key: string]: any[] },
  output = ns.tprint
) {
  const header = Object.keys(table);
  const cols = Object.values(table).map((col) =>
    col.map((v) => v?.toString() || "")
  );
  const rows = cols[0].map((_, i) => cols.map((col) => col[i]));

  const colWidths = header.map((columnHeader, i) => {
    return Math.max(
      stripColors(columnHeader).length,
      ...(cols[i]?.map((v) => stripColors(v || "").length) || [])
    );
  });

  output(
    [
      "",
      header.map((v, i) => v.padStart(colWidths[i], " ")).join(" | "),
      header.map((_, i) => "".padStart(colWidths[i], "-")).join(" | "),
      rows
        .map((row) =>
          row
            .map(
              (v, i) =>
                "".padStart(colWidths[i] - stripColors(v || "").length, " ") +
                (v || "")
            )
            .join(" | ")
        )
        .join("\n"),
    ].join("\n")
  );
}

// Returns a weight that can be used to sort servers by hack desirability
export function weight(ns: NS, server: string) {
  if (!server) return 0;

  // Don't ask, endgame stuff
  if (server.startsWith("hacknet-node")) return 0;

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
  if (ns.fileExists("Formulas.exe")) {
    // We use weakenTime instead of minDifficulty since we got access to it,
    // and we add hackChance to the mix (pre-formulas.exe hack chance formula is based on current security, which is useless)
    weight =
      ((so.moneyMax || 0) / ns.formulas.hacking.weakenTime(so, player)) *
      ns.formulas.hacking.hackChance(so, player);
  }
  // If we do not have formulas, we can't properly factor in hackchance, so we lower the hacking level tolerance by half
  else if ((so.requiredHackingSkill || 0) > player.skills.hacking / 2) return 0;

  return weight;
}

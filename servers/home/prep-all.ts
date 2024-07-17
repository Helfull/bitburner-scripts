import { getServers, setupDefault, weight } from "./cnc/lib";
import { BY_WEIGHT } from "./server/sort";
import {
  HAS_ADMIN_ACCESS,
  HAS_MONEY,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
  IS_PREPPED,
  NEEDS_PREP,
} from "./server/filter";

export async function main(ns: NS) {
  const args = setupDefault(ns);

  let targets = getServers(ns)
    .filter(IS_NOT_PRIVATE(ns))
    .filter(IS_NOT_HOME(ns))
    .filter(HAS_ADMIN_ACCESS(ns))
    .filter(HAS_MONEY(ns))
    .sort(BY_WEIGHT(ns));

  ns.print(JSON.stringify(targets, null, 2));

  ns.setTitle(ns.sprintf("Targetting %s", targets.join(", ")));

  while (targets.length > 0) {
    targets = filterPrepped(ns, targets);

    ns.print(JSON.stringify(targets, null, 2));
    const target = ns.getServer(targets.shift());

    ns.print(`Targetting ${target.hostname}`);
    ns.setTitle(ns.sprintf("Targetting %s", target.hostname));
    let pid = ns.run("prep.js", 1, target.hostname);

    if (pid === 0) {
      ns.tprint(`Failed to run prep.js on ${target}`);
    }

    do {
      await ns.sleep(10000);

      targets = filterPrepped(ns, targets);
    } while (ns.isRunning(pid));

    handToProto(ns, target.hostname);
  }
}

function filterPrepped(ns: NS, targets: string[]) {
  ns.print(`Filtering prepped servers`);
  targets.filter(IS_PREPPED(ns)).forEach((t) => {
    ns.print(`Prepped ${t} starting proto batch`);
    handToProto(ns, t);
  });

  return targets.filter(NEEDS_PREP(ns));
}

function handToProto(ns: NS, target: string) {
  const pid = ns.run("proto-batch.js", 1, target);

  if (pid === 0) {
    ns.tprint(`Failed to run proto-batch.js on ${target}`);
  }

  return pid;
}

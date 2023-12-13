import { _ } from 'cli-colors.js';
import { NS } from '../../NetscriptDefinitions';

export async function main(ns: NS) {
  const slave = ns.args[0] as string;
  const settings = JSON.parse((ns.args[1] as string).replace("'", '"'))

  if (settings.target.length == 0) return;

  const serverRam = ns.getServerMaxRam(slave) - ns.getServerUsedRam(slave);

  if (serverRam == 0) return;

  const wknRam = ns.getScriptRam(settings.sweaken);
  const grwRam = ns.getScriptRam(settings.sgrow);
  const hckRam = ns.getScriptRam(settings.shack);

  let wknRatio = settings.wknRatio;
  let grwRatio = settings.grwRatio;
  let hckRatio = settings.hckRatio;

  let ramPerAttack =
    wknRam * wknRatio +
    grwRam * grwRatio +
    hckRam * hckRatio

  while (ramPerAttack > serverRam) {
    wknRatio = Math.min(1, settings.wknRatio / 2);
    grwRatio = Math.min(1, settings.grwRatio / 2);
    hckRatio = Math.min(1, settings.hckRatio / 2);
    ramPerAttack =
      wknRam * wknRatio +
      grwRam * grwRatio +
      hckRam * hckRatio

    if (wknRatio +grwRatio + hckRatio === 3) {
      ns.printf('Not enough ram on %s to execute attack!', slave);
      ns.exit()
    }
  }

  const maxTargets = Math.min(settings.target.length, Math.floor(serverRam / ramPerAttack));

  const ramPerTarget = Math.floor(serverRam / maxTargets);
  const attacksPerTarget = Math.floor(ramPerTarget / ramPerAttack);

  ns.printf(`ServerRam: %s`, ns.formatRam(serverRam))

  ns.printf(`wknRam: %s`, ns.formatRam(wknRam))
  ns.printf(`grwRam: %s`, ns.formatRam(grwRam))
  ns.printf(`hckRam: %s`, ns.formatRam(hckRam))

  ns.printf(`Max Targets: %s`, maxTargets)
  ns.printf(`Per attack ram: %s`, ns.formatRam(ramPerAttack))
  ns.printf(`Ram per target: %s`, ns.formatRam(ramPerTarget))
  ns.printf(`--`)
  ns.printf(`Total attacks: %s`, Math.floor(serverRam / ramPerAttack))
  ns.printf(`Attacks per target: %s`, attacksPerTarget)
  ns.printf(`--`)
  ns.printf(`  Ram Per weaken: %s`, wknRam)
  ns.printf(`  Ratio weaken: %s`, wknRatio)
  ns.printf(`  Threads Per weaken: %s`, attacksPerTarget * wknRatio)
  ns.printf(` `)
  ns.printf(`  Ram Per grow: %s`, grwRam)
  ns.printf(`  Ratio grow: %s`, grwRatio)
  ns.printf(`  Threads Per grow: %s`, attacksPerTarget * grwRatio)
  ns.printf(` `)
  ns.printf(`  Ram Per hack: %s`, hckRam)
  ns.printf(`  Ratio hack: %s`, hckRatio)
  ns.printf(`  Threads Per hack: %s`, attacksPerTarget * hckRatio)
  ns.printf(`--`)
  const excessRam = serverRam - (ramPerAttack * maxTargets * attacksPerTarget)
  ns.printf('Using Ram %s', ns.formatRam(ramPerAttack * maxTargets))
  ns.printf('Excess Ram %s', ns.formatRam(excessRam || 0))
  const additionalGrowPerTarget = Math.floor(excessRam / grwRam / maxTargets)
  ns.printf('Additional grw threads per target %s', additionalGrowPerTarget)

  if (attacksPerTarget == 0) return;

  ns.exec('provision.js', 'home', 1, slave);

  await ns.asleep(1000);

  for (const target of settings.target.slice(Math.max(settings.target.length - maxTargets, 0))) {
    ns.exec(settings.sweaken, slave, attacksPerTarget * wknRatio, target)
    ns.exec(settings.sgrow, slave, attacksPerTarget * grwRatio, target)
    ns.exec(settings.shack, slave, attacksPerTarget * hckRatio, target)

    if (additionalGrowPerTarget > 0) {
      ns.exec(settings.sgrow, slave, additionalGrowPerTarget, target)
    }
  }
}
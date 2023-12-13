/** @param {NS} ns */
export async function main(ns) {
  const slave = ns.args[0];
  const settings = JSON.parse(ns.args[1].replace("'", '"'))

  const availableRam = ns.getServerMaxRam(slave) - ns.getServerUsedRam(slave);

  const totalThreads = Math.floor(availableRam / ns.getScriptRam(settings.script));
  let threadsPerTarget = Math.floor(totalThreads / settings.target.length);

  if (threadsPerTarget <= 0) return;

  ns.print(`Total Threads: ` + totalThreads);
  ns.print(`Threads Per Target: ` + threadsPerTarget);

  ns.killall(slave);

  ns.exec('provision.js', 'home', 1, slave);

  for (const target of settings.target) {
    ns.exec(settings.script, slave, threadsPerTarget, target)
  }
}
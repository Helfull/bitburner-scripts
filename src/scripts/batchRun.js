/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const script = ns.args[1];
  let runThreads = ns.args[2];
  const hostname = ns.getHostname();

  let availableThreads = runThreads;

  const scriptRam = ns.getScriptRam(script);

  const availableRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);

  if (availableRam < scriptRam) {
    ns.alert(ns.sprintf("Not enough RAM on host %s", hostname))
    ns.exit()
  }

  if ((scriptRam * runThreads) > availableRam) {
    availableThreads = Math.floor(availableRam / scriptRam);
  }
  
  ns.alert(ns.sprintf('Batch running %s for %s\n  Required Threads %s\n  Running in batches of %s', script, target, runThreads, availableThreads));
  while (runThreads > 0) {
    await batchRun(ns, hostname, availableThreads, target, script);
    runThreads = runThreads - availableThreads
  }
}
/** @param {NS} ns */
async function batchRun(ns, hostname, threads, target, script) {
  const wknPID = ns.exec(script, hostname, threads, target);
  while(ns.isRunning(wknPID)) {
    await ns.asleep(10000);
  }
}
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const hostname = ns.getHostname();

  let wknThreads = Math.ceil(ns.getServerSecurityLevel(target) / 0.05);
  let availableThreads = wknThreads;

  const scriptRam = ns.getScriptRam('scripts/weaken.js');

  // wait to have enough ram
  while (getAvailableRam(ns, hostname) < scriptRam) {
    await ns.asleep(10000)
  }

  while (wknThreads > 0) {
    availableThreads = getAvailableThreads(getAvailableRam(ns, hostname), scriptRam)

    if (availableThreads > wknThreads) {
      availableThreads = wknThreads
    }

    try {
      await batchWeaken(ns, hostname, availableThreads, target);
    } catch (e) {
      ns.print(e)
      ns.toast("Error: " + e, "error")
    }

    wknThreads = wknThreads - availableThreads
  }
}

function getAvailableRam(ns, hostname) {
  return ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
}

function getAvailableThreads(availableRam, scriptRam) {
  return Math.floor(availableRam / scriptRam)
}

/** @param {NS} ns */
async function batchWeaken(ns, hostname, threads, target) {
  const wknPID = ns.exec('scripts/weaken.js', hostname, threads, target);
  while(ns.isRunning(wknPID)) {
    await ns.asleep(10000);
  }
}
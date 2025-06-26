import { isPrepped } from '@/servers/home/batcher/utils';
import { exec, proxy, proxyNs } from '@lib/ram-dodge';

export const SEC_DEC_WKN = 0.05;
export const SEC_INC_HCK = 0.002;
export const SEC_INC_GRW = 0.004;

async function execProxy(ns: NS, script: string, threads: number, ...args: any[]) {
  const ramCost = ns.getScriptRam(script);
  return await proxy(ns, script, {
    threads,
    ramOverride: ramCost,
    temporary: true
  }, ...args);
}

async function mostRamServer(ns: NS): Promise<[string, number]> {
  return await proxy(ns, 'lib/findMostRam.js', {
    threads: 1,
    temporary: true,
    ramOverride: ns.getScriptRam('lib/findMostRam.js')
  });
}

export async function main(ns: NS) {
  ns.disableLog('sleep');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getWeakenTime');
  ns.disableLog('getGrowTime');
  ns.disableLog('getHackTime');

  ns.clearLog();

  const target = ns.args[0] as string;

  ns.ui.setTailTitle('Starting batcher for target: ' + target);

  await hwgw(ns, target);
}

function nsExec(ns: NS, script: string, host: string, threads: number, ...args: any[]) {

  ns.scp(script, host, 'home');
  const pid = ns.exec(script, host, { threads }, ...args);

  if (pid === 0) {
    ns.print(`Failed to execute script ${script} on host ${host} with args: ${args.join(', ')}`);
    return 0;
  }

  ns.print(`Executed script ${script} on host ${host} with args: ${args.join(', ')}, PID: ${pid}`);
  return pid;
}

async function prep(ns: NS, target: string) {
  let runningScripts = [];

  ns.ui.setTailTitle('Prepping target: ' + target);
  while (!isPrepped(ns, target)) {
    const [ramServer, mostRam] = await mostRamServer(ns);
    let maxThreads = Math.floor(mostRam / 1.75);
    ns.print(`Most RAM server: ${ramServer} with ${ns.formatRam(mostRam)} RAM, max threads: ${maxThreads}`);

    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const currentSecurity = ns.getServerSecurityLevel(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);

    await ns.sleep(1000);
    switch(true) {
      case (currentMoney < maxMoney):
        const growThreads = Math.min(Math.ceil(ns.growthAnalyze(target, maxMoney / currentMoney)));

        runningScripts.push(nsExec(ns, 'batcher/scripts/grow.js', ramServer, growThreads, target, 0, 0));
        break;
      case (currentSecurity > minSecurity):
        const weakenThreads = Math.min(maxThreads, Math.ceil((currentSecurity - minSecurity) / SEC_DEC_WKN));
        runningScripts.push(nsExec(ns, 'batcher/scripts/weaken.js', ramServer, weakenThreads, target, 0, 0));
        break;
    }

    ns.print(`Running scripts: ${runningScripts.join(', ')}`);
    while(runningScripts.some((pid) => ns.isRunning(pid))) {
      await ns.sleep(1000);
    }
    ns.print(`All scripts finished, checking if ${target} is prepped...`);

    runningScripts = [];
  }
}

async function hwgw(ns: NS, target: string) {

  await prep(ns, target);

  ns.ui.setTailTitle('Batching target: ' + target);
  while (true) {
    const maxMoney = ns.getServerMaxMoney(target);
    const wknTime = ns.getWeakenTime(target);
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);

    const hPercent = ns.hackAnalyze(target);

    const amount = maxMoney * 0.1;

    const hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, amount)));
    const tGreed = hPercent * hackThreads;
    const growThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / (maxMoney - maxMoney * tGreed)));

    const wkn1Threads = Math.max(Math.ceil(hackThreads * SEC_INC_HCK / SEC_DEC_WKN), 1);
    const wkn2Threads = Math.max(Math.ceil(growThreads * SEC_INC_GRW / SEC_DEC_WKN), 1);

    const endhackTime = Date.now() + wknTime;
    const endWkn1Time = Date.now() + wknTime + 5;
    const endGrowTime = Date.now() + wknTime + 10;
    const endWkn2Time = Date.now() + wknTime + 15;

    ns.print(`End times:
    Hack: ${endhackTime - Date.now()}
    Wkn1: ${endWkn1Time - Date.now()}
    Grow: ${endGrowTime - Date.now()}
    Wkn2: ${endWkn2Time - Date.now()}`);

    ns.print(`Threads:
    Hack: ${hackThreads}
    Wkn1: ${wkn1Threads}
    Grow: ${growThreads}
    Wkn2: ${wkn2Threads}`);

    ns.print(`Ram usage:
    Hack: ${ns.formatRam(ns.getScriptRam('batcher/scripts/hack.js') * hackThreads)}
    Wkn1: ${ns.formatRam(ns.getScriptRam('batcher/scripts/weaken.js') * wkn1Threads)}
    Grow: ${ns.formatRam(ns.getScriptRam('batcher/scripts/grow.js') * growThreads)}
    Wkn2: ${ns.formatRam(ns.getScriptRam('batcher/scripts/weaken.js') * wkn2Threads)}`);

    if (hackThreads > 0) await execProxy(ns, 'batcher/scripts/hack.js', hackThreads, target, endhackTime, hackTime);
    if (wkn1Threads > 0) await execProxy(ns, 'batcher/scripts/weaken.js', wkn1Threads, target, endWkn1Time, wknTime);
    if (growThreads > 0) await execProxy(ns, 'batcher/scripts/grow.js', growThreads, target, endGrowTime, growTime);
    if (wkn2Threads > 0) await execProxy(ns, 'batcher/scripts/weaken.js', wkn2Threads, target, endWkn2Time, wknTime);

    await ns.sleep(20);
  }
}

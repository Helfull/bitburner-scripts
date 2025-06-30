import { Color } from '@lib/colors';
import { HAS_ADMIN_ACCESS, HAS_AVAILABLE_RAM, IS_NOT_HOME } from '@/servers/home/server/filter';
import { getServers } from '@lib/utils';
import { BY_RAM_USAGE } from '@/servers/home/server/sort';
import { ramAvailable } from '@/servers/home/server/utils';
import { prep } from '@/servers/home/batcher/prepper';
import { Metrics } from '@/servers/home/batcher/Metrics';
import { SEC_DEC_WKN, SEC_INC_GRW, SEC_INC_HCK } from '@/servers/home/batcher/Server';
import { Statistics } from '@/servers/home/batcher/statistics';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('exec')

  ns.clearLog();

  const target = ns.args[0] as string;
  const visualizer: number = ns.args[1] as number || -1;

  ns.ui.setTailTitle('Starting batcher for target: ' + target);

  await hwgw(ns, target, visualizer);
}

export function getExecServer(ns: NS, script: string, threads: number, ramNeeded: number): string|false {
  const server = getServers(ns)
    .filter(IS_NOT_HOME(ns))
    .filter(HAS_ADMIN_ACCESS(ns))
    .filter(HAS_AVAILABLE_RAM(ns, ramNeeded))
    .sort(BY_RAM_USAGE(ns))
    .pop()

  if (!server) {
    if (ramAvailable(ns, "home") < ramNeeded) {
      ns.printf('ERROR | Not enough RAM available to run %s with %d threads. Required: %s', script, threads, ns.formatRam(ramNeeded));
      return false;
    }
    return 'home';
  }

  return server;
}

function execProxy(ns: NS, script: string, threads: number, ...args: any[]) {
  const ramCost = ns.getScriptRam(script);
  const execServer = getExecServer(ns, script, threads, ramCost * threads);

  if (!execServer) {
    ns.print(`ERROR | Not enough RAM available to run script ${script} with ${threads} threads.`);
    return 0;
  }

  ns.scp(script, execServer, 'home');
  return ns.exec(script, execServer, { threads, temporary: true }, ...args);
}

async function hwgw(ns: NS, target: string, visualizerPort: number = -1) {

  await prep(ns, target);

  ns.ui.setTailTitle('Batching target: ' + target);

  const statistics = {
    batches: 0,
    totalThreads: 0,
    totalRam: 0,
    totalHack: 0,
    totalGrow: 0,
    totalWeaken: 0,
  };
  const batchesPids = [];

  ns.atExit(() => {
    ns.print(`Exiting batcher script. Cleaning up...`);
    for (let pid of batchesPids) {
      if (ns.isRunning(pid)) {
        ns.kill(pid);
        ns.print(`Killed script with PID: ${pid}`);
      }
    }
    ns.print(`Cleanup complete.`);
  }, 'batcher-exit-cleanup' + ns.pid);

  const maxMoney = ns.getServerMaxMoney(target);
  const greed = 0.1;

  let lastWeakenResult = {
    delay: 0,
    endtime: 0,
    now: Date.now(),
  };
  while (true) {
    if (visualizerPort > 0) {
      ns.tryWritePort(visualizerPort, JSON.stringify({
        batch: statistics.batches,
        lastWeakenResult,
        serverStats: {
          target,
          currentMoney: ns.getServerMoneyAvailable(target),
          maxMoney,
          currentSecurity: ns.getServerSecurityLevel(target),
          minSecurity: ns.getServerMinSecurityLevel(target),
          hackChance: ns.hackAnalyzeChance(target),
        }
      } satisfies Statistics));
    }

    if (ns.getServerMinSecurityLevel(target) !== ns.getServerSecurityLevel(target)) {
      ns.print(`ERROR | Security level of ${target} is not at minimum level. Current: ${ns.getServerSecurityLevel(target)}, Min: ${ns.getServerMinSecurityLevel(target)}`);
      ns.print(`Waiting for security level to stabilize...`);

      while(ns.getServerMinSecurityLevel(target) !== ns.getServerSecurityLevel(target)) {
        await ns.sleep(0);
      }
      continue;
    }

    if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
      ns.print(`ERROR | Not enough money on ${target}. Current: ${ns.getServerMoneyAvailable(target)}, Required: ${ns.getServerMaxMoney(target)}`);
      ns.print(`Waiting for money to stabilize...`);
      while(ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        await ns.sleep(0);
      }
      continue;
    }

    const hackPercentThread = ns.hackAnalyze(target);
    const hackThreads = Math.floor(greed / hackPercentThread);

    /**
     * If we greed with less than 1 thread we increase to atleast 1 thread of hack.
     *
     * This means we have to recalculate the greed amount to be at least 1 thread of hack.
     */
    const hPercent = hackThreads * hackPercentThread;
    const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / (1 - hPercent)) * 1.01);

    const wkn1Threads = Math.max(Math.ceil(hackThreads * SEC_INC_HCK / SEC_DEC_WKN), 1);
    const wkn2Threads = Math.max(Math.ceil(growThreads * SEC_INC_GRW / SEC_DEC_WKN), 1);

    const wknTime = ns.getWeakenTime(target);
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);

    const endhackTime = Date.now() + lastWeakenResult.delay + wknTime;
    const endWkn1Time = Date.now() + lastWeakenResult.delay + wknTime;
    const endGrowTime = Date.now() + lastWeakenResult.delay + wknTime;
    const endWkn2Time = Date.now() + lastWeakenResult.delay + wknTime;

    if (visualizerPort > 0) {
      ns.tryWritePort(visualizerPort, JSON.stringify({
        batch: statistics.batches,
        lastWeakenResult,
        times: {
          start: Date.now(),
          endHack: endhackTime,
          endWkn1: endWkn1Time,
          endGrow: endGrowTime,
          endWkn2: endWkn2Time,
        },
        serverStats: {
          target,
          currentMoney: ns.getServerMoneyAvailable(target),
          maxMoney,
          currentSecurity: ns.getServerSecurityLevel(target),
          minSecurity: ns.getServerMinSecurityLevel(target),
        },
        batchStats: {
          greed,
          hackPercentThread,
          hPercent,
          hackThreads,
          wkn1Threads,
          growThreads,
          wkn2Threads,
          wknTime,
          growTime,
          hackTime,
        }
      } satisfies Statistics));
    }

    const batchPids = [];

    if (hackThreads > 0) {
      ns.print('Staring batcher/scripts/hack.js');
      batchPids.push(execProxy(ns, 'batcher/scripts/hack.js', hackThreads, target, endhackTime, hackTime, ns.pid));
      statistics.totalHack++;
    }

    if (wkn1Threads > 0) {
      ns.print('Staring batcher/scripts/weaken.js');
      batchPids.push(execProxy(ns, 'batcher/scripts/weaken.js', wkn1Threads, target, endWkn1Time, wknTime, ns.pid));
      statistics.totalWeaken++;
    }

    if (growThreads > 0) {
      ns.print('Staring batcher/scripts/grow.js');
      batchPids.push(execProxy(ns, 'batcher/scripts/grow.js', growThreads, target, endGrowTime, growTime, ns.pid));
      statistics.totalGrow++;
    }

    if (wkn2Threads > 0) {
      ns.print('Staring batcher/scripts/weaken.js');
      batchPids.push(execProxy(ns, 'batcher/scripts/weaken.js', wkn2Threads, target, endWkn2Time, wknTime, ns.pid));
      statistics.totalWeaken++;
    }

    ns.print(`Batch PIDs: ${batchPids.join(', ')}`);
    if (batchPids.some(pid => pid === 0) || batchPids.length !== 4) {
      ns.print(`ERROR | Failed to start batch. Not enough RAM available or script execution failed.`);
      for (let sPid of batchPids) {
        if (sPid > 0 && ns.isRunning(sPid)) {
          ns.kill(sPid);
          ns.print(`WARN | Killed script with PID: ${sPid}`);
        }
      }
    } else {
      batchesPids.push(...batchPids);
      statistics.batches++;

      statistics.totalThreads += hackThreads + wkn1Threads + growThreads + wkn2Threads;
      statistics.totalRam += ns.getScriptRam('batcher/scripts/hack.js') * hackThreads +
                         ns.getScriptRam('batcher/scripts/weaken.js') * (wkn1Threads + wkn2Threads) +
                         ns.getScriptRam('batcher/scripts/grow.js') * growThreads;
    }

    ns.print(`
Greed: ${greed}(~${Color.green.wrap(ns.formatNumber(maxMoney * 0.1))})    
Batch ${statistics.batches} started.

Running scripts count: ${batchesPids.length}

Batch Details:
  Hack Threads: ${hackThreads}
  Weaken Threads 1: ${wkn1Threads}
  Grow Threads: ${growThreads}
  Weaken Threads 2: ${wkn2Threads}
    
Times:
  end Hack Time:     ${endhackTime} (${ns.tFormat(endhackTime - Date.now())})
  end Weaken 1 Time: ${endWkn1Time} (${ns.tFormat(endWkn1Time - Date.now())}) (${endWkn1Time - endhackTime})
  end Grow Time:     ${endGrowTime} (${ns.tFormat(endGrowTime - Date.now())}) (${endGrowTime - endWkn1Time})
  end Weaken 2 Time: ${endWkn2Time} (${ns.tFormat(endWkn2Time - Date.now())}) (${endWkn2Time - endGrowTime})
  
Metrics:
  Total Threads: ${statistics.totalThreads}
  Total RAM: ${ns.formatRam(statistics.totalRam)}
  Total Hack: ${statistics.totalHack}
  Total Grow: ${statistics.totalGrow}
  Total Weaken: ${statistics.totalWeaken}
   
Server stats:
  Target: ${Color.white.bold.wrap(target)}
  Current Money: ${Color.bold.wrap(ns.formatNumber(ns.getServerMoneyAvailable(target)))}
  Max Money: ${ns.formatNumber(maxMoney)}
  Current Security: ${Color.bold.wrap(ns.getServerSecurityLevel(target).toFixed(2))}
  Min Security: ${ns.getServerMinSecurityLevel(target).toFixed(2)}
    `);

    ns.print(`Waiting for next batch...`);

    while(await ns.nextPortWrite(ns.pid)) {
      const portData = JSON.parse(await ns.readPort(ns.pid));
      try {
        ns.printf(JSON.stringify(portData));

        if (portData.type !== 'weaken') {
          ns.print(`ERROR | Last weaken result is not a weaken result. Type: ${portData.type}`);
        } else {
          lastWeakenResult = portData;
          break;
        }
      } catch (e) {
        ns.printf(`ERROR | Failed to parse last weaken result: ${e}`);
      }
    }
  }
}

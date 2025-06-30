import { isMinDifficulty, isPrepped } from '@/servers/home/batcher/utils';
import { exec, proxy, proxyNs } from '@lib/ram-dodge';
import { getServers } from '@lib/utils';
import { HAS_ADMIN_ACCESS, HAS_AVAILABLE_RAM, HAS_RAM_AVAILABLE, IS_NOT_HOME } from '@/servers/home/server/filter';
import { BY_RAM_USAGE } from '@/servers/home/server/sort';
import { ramAvailable } from '@/servers/home/server/utils';
import { Color } from '@lib/colors';
import { getExecServer } from '@/servers/home/batcher/batcher';
import { Server } from '@/servers/home/batcher/Server';
import { Metrics } from '@/servers/home/batcher/Metrics';

export const SEC_DEC_WKN = 0.05;
export const SEC_INC_HCK = 0.002;
export const SEC_INC_GRW = 0.004;

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

function tryExec(ns: NS, script: string, threads: number, ...args: any[]) {
  if (threads <= 0) {
    ns.print(`WARN | Tried to execute script ${script} with ${threads} threads, which is not allowed.`);
    return 0;
  }

  const host = getExecServer(ns, script, threads,  threads* 1.75)

  if (!host) {
    ns.print(`WARN | Not enough RAM available to run grow script with ${threads} threads.`);
    return tryExec(ns, script, Math.ceil(threads / 2), ...args);
  }

  return nsExec(ns, script, host, threads, ...args);
}

export async function prep(ns: NS, target: string) {
  let runningScripts = [];

  ns.ui.setTailTitle('Prepping target: ' + target);

  ns.print(`Preparing target server: ${target}`);

  ns.atExit(() => {
    ns.print(`Exiting prep script. Cleaning up...`);
    for (let pid of runningScripts) {
      if (ns.isRunning(pid)) {
        ns.kill(pid);
        ns.print(`Killed script with PID: ${pid}`);
      }
    }
    ns.print(`Cleanup complete.`);
  }, 'prep-exit-cleanup' + ns.pid);

  while (!isPrepped(ns, target)) {
    const server = new Server(ns, target);

    switch(false) {
      case (server.isMaxMoney):
        const growThreads = Math.min(Math.ceil(ns.growthAnalyze(target, server.maxMoney / server.currentMoney)));
        runningScripts.push(tryExec(ns, 'batcher/scripts/grow.js', growThreads, target, 0, 0));
        break;
      case (server.isMinDifficulty):
        const weakenThreads = Math.ceil((server.deltaSecurity) / SEC_DEC_WKN);
        runningScripts.push(tryExec(ns, 'batcher/scripts/weaken.js', weakenThreads, target, 0, 0));
        break;
    }

    ns.print(`Running scripts: ${runningScripts.join(', ')}`);
    while(runningScripts.some((pid) => ns.isRunning(pid))) {
      await ns.sleep(1000);
    }
    ns.print(`All scripts finished, checking if ${target} is prepped...`);

    runningScripts = [];
  }

  ns.print(`Target ${target} is prepped!`);
}

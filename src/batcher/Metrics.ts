import { NS } from "@ns";

export interface BatchMetrics {
  grwThreads: number;

  grwWknThreads: number;

  hckThreads: number;

  hckWknThreads: number;

  times: {
    weakenGrow: number;
    grow: number;
    weakenHack: number;
    hack: number;
  };

  delays: {
    weakenGrow: number;
    grow: number;
    weakenHack: number;
    hack: number;
  };

  finishTimes: {
    weakenGrow: number;
    grow: number;
    weakenHack: number;
    hack: number;
  };
}

export interface PrepMetrics {
  wknThreads: number;

  grwThreads: number;

  grwWknThreads: number;
}

const SEC_DEC_WKN = 0.05;
const SEC_INC_HCK = 0.002;
const SEC_INC_GRW = 0.004;

const SERVER_BASE_GROWTH_RATE = 1.03;
const SERVER_MAX_GROWTH_RATE = 1.0035;

export class Metrics {

  constructor(
    private readonly ns: NS,
    private readonly bufferDelay = 20,
    private readonly offset = 5,
    ) {
  }

  calcPrep(target: string): PrepMetrics {
    const curSecurity = this.ns.getServerSecurityLevel(target);
    const minSecurity = this.ns.getServerMinSecurityLevel(target);

    const curMoney = this.ns.getServerMoneyAvailable(target);
    const maxMoney = this.ns.getServerMaxMoney(target);

    const grwThreads = this.calcGrow(target, maxMoney, curMoney);

    return {
      wknThreads: Math.ceil((curSecurity - minSecurity) / 0.05),
      grwThreads,
      grwWknThreads: Math.max(Math.ceil(grwThreads * SEC_INC_GRW / SEC_DEC_WKN), 1),
    };
  }

  calcGreedy(target: string, threads = 1) {
    const server = this.ns.getServer(target);
    const player = this.ns.getPlayer();
    // 2. Calculate how much money a grow of that size would restore.

    // Grow calculation:

    const hackDifficulty = server.hackDifficulty ?? 100;
    const ajdGrowthRate = Math.min(SERVER_MAX_GROWTH_RATE, 1 + (SERVER_BASE_GROWTH_RATE - 1)  / hackDifficulty);

    function srvGrowthPercent(targettingThreads: number) {
      if (!server.serverGrowth) throw new Error('Server has no growth rate.');

      const serverGrowthPercentage = server.serverGrowth / 100;
      const srcGrwCycles = Math.max(Math.ceil(targettingThreads), 0);
      const adjSrvGrwCycles = srcGrwCycles * serverGrowthPercentage * 1;
      return Math.pow(ajdGrowthRate, adjSrvGrwCycles * player.mults.hacking_grow);
    }

    const srvGrowthPerc = srvGrowthPercent(threads);
    this.ns.tprintf('INFO | Grow Threads: %s', this.ns.formatNumber(threads, 0));
    this.ns.tprintf('INFO | Server Growth Percent: %s', this.ns.formatPercent(srvGrowthPerc));
    this.ns.tprintf('INFO | Server Growth Percent (raw): %s', srvGrowthPerc);
    this.ns.tprintf('INFO | Server Growth Money: %s', this.ns.formatNumber((server.moneyAvailable || 0) * srvGrowthPerc));
    this.ns.tprintf('INFO | Server Max Money: %s', this.ns.formatNumber(server.moneyMax || 0));

    if (srvGrowthPerc > 1) {
      // Reduce the number of threads to grow only to the max money.
      threads = Math.ceil(threads / srvGrowthPerc);
    }

    this.ns.tprintf('INFO | Grow Threads (adjusted): %s', this.ns.formatNumber(threads, 0));
    this.ns.tprintf('INFO | Server Growth Percent: %s', this.ns.formatPercent(srvGrowthPercent(threads)));

    // 3. Calculate the hack threads needed to take that much money.

    // 4. Calculate the two weaken thread counts needed to restore min security after the hack and grow.
  }

  calcBatch(target: string, greed = 0.1, startDelay = 0): BatchMetrics {
    const wknTime = this.ns.getWeakenTime(target);
    const maxMoney = this.ns.getServerMaxMoney(target);
    const amount = maxMoney * greed;
    const hckPercent = this.ns.hackAnalyze(target);
    const hckThreads = Math.max(Math.floor(this.ns.hackAnalyzeThreads(target, amount)), 1);
    const tGreed = hckPercent * hckThreads;
    const grwThreads = this.calcGrow(target, maxMoney, (maxMoney - maxMoney * tGreed));

    const times = {
      hack: wknTime / 4,
      weakenHack: wknTime,
      grow: wknTime * 0.8,
      weakenGrow: wknTime,
    };

    const delayHack = startDelay + (times.weakenHack - times.hack) + this.offset * 0;
    const delayWeakenHack = startDelay + this.offset * 1;
    const delayGrow = startDelay + (times.weakenHack - times.grow) + this.offset * 2;
    const delayWeakenGrow = startDelay + (times.weakenHack - times.weakenGrow) + this.offset * 3;

    const finishTimes = {
      hack: this.bufferDelay + delayHack + times.hack,
      weakenHack: this.bufferDelay + delayWeakenHack + times.weakenHack,
      grow: this.bufferDelay + delayGrow + times.grow,
      weakenGrow: this.bufferDelay + delayWeakenGrow + times.weakenGrow,
    }

    return {
      grwThreads,
      hckThreads,

      grwWknThreads: Math.max(Math.ceil(grwThreads * SEC_INC_GRW / SEC_DEC_WKN), 1),
      hckWknThreads: Math.max(Math.ceil(hckThreads * SEC_INC_HCK / SEC_DEC_WKN), 1),

      times,

      delays: {
        hack: delayHack,
        weakenHack: delayWeakenHack,
        grow: delayGrow,
        weakenGrow: delayWeakenGrow,
      },

      finishTimes,
    };
  }

  calcGrow(target: string, maxMoney: number, curMoney: number): number {
    return Math.ceil(this.ns.growthAnalyze(target, maxMoney / curMoney));
  }

}
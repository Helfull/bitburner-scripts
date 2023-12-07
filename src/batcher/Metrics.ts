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
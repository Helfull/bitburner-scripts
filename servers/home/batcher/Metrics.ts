import { Logger } from "../tools/logger";


export class MetricError extends Error {

  public data?: Record<string, any>;

  constructor(message: string, data?: Record<string, any>) {
    super(message + (data ? `: ${JSON.stringify(data)}` : ''));
    this.name = this.constructor.name;
    this.data = data;
  }
}

export interface BatchMetrics {
  maxMoney: number;

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

  finishTimes: {
    weaken: number;
    grow: number;
    weakenGrow: number;
  }
}

const SEC_DEC_WKN = 0.05;
const SEC_INC_HCK = 0.002;
const SEC_INC_GRW = 0.004;

export class Metrics {

  constructor(
    private readonly ns: NS,
    private readonly bufferDelay = 20,
    private readonly offset = 5,
    private readonly log = new Logger(ns),
    ) {
  }

  calcPrep(target: string): PrepMetrics {
    const curSecurity = this.ns.getServerSecurityLevel(target);
    const minSecurity = this.ns.getServerMinSecurityLevel(target);

    const curMoney = this.ns.getServerMoneyAvailable(target);
    const maxMoney = this.ns.getServerMaxMoney(target);

    const grwThreads = this.calcGrowThreads(target, maxMoney, curMoney);

    // Goal Weaken Grow Weaken
    // With a 5ms delay between each

    const wknTime = this.ns.getWeakenTime(target);

    const times = {
      weaken: wknTime,
      grow: wknTime * 0.8,
      weakenGrow: wknTime,
    };

    const delayWeaken = this.offset * 0;
    const delayGrow = (times.weaken - times.grow) + this.offset * 0;
    const delayWeakenGrow = (times.weaken - times.weakenGrow) + this.offset * 0;

    const finishTimes = {
      weaken: this.bufferDelay + delayWeaken + times.weaken,
      grow: this.bufferDelay + delayGrow + times.grow,
      weakenGrow: this.bufferDelay + delayWeakenGrow + times.weakenGrow,
    }

    return {
      wknThreads: Math.ceil((curSecurity - minSecurity) / 0.05),
      grwThreads,
      grwWknThreads: Math.max(Math.ceil(grwThreads * SEC_INC_GRW / SEC_DEC_WKN), 1),

      finishTimes,
    };
  }

  calcBatch(target: string, greed = 0.1, startDelay = 0): BatchMetrics {
    const wknTime = this.ns.getWeakenTime(target);
    const maxMoney = this.ns.getServerMaxMoney(target);
    const amount = maxMoney * greed;
    const hckPercent = this.ns.hackAnalyze(target);
    const hckThreads = Math.max(Math.floor(this.ns.hackAnalyzeThreads(target, amount)), 1);
    const tGreed = hckPercent * hckThreads;
    const grwThreads = this.calcGrowThreads(target, maxMoney, (maxMoney - maxMoney * tGreed));

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

    this.log.log(JSON.stringify(finishTimes, null, 2));

    this.log.log('Batch Metrics:');
    // Finish time differences
    this.log.log(`Hack: ${finishTimes.hack}`);
    this.log.log(`WeakenHack: ${finishTimes.weakenHack}`);
    this.log.log(`Grow: ${finishTimes.grow}`);
    this.log.log(`WeakenGrow: ${finishTimes.weakenGrow}`);

    // Are they finishing within 20ms of each other?
    const diff1 = Math.abs(finishTimes.hack - finishTimes.weakenHack);
    const diff2 = Math.abs(finishTimes.grow - finishTimes.weakenGrow);
    this.log.log(`(Hack => weaken): ${diff1}`);
    this.log.log(`(Grow => weaken): ${diff2}`);


    return {
      maxMoney,

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

  calcGrowThreads(target: string, maxMoney: number, curMoney: number): number {
    if (maxMoney <= 0) return 0;
    if (isNaN(maxMoney / curMoney)) {
      throw new MetricError('maxMoney / curMoney is NaN', {maxMoney, curMoney});
    }

    this.log.log(`Growth Analyze: ${target} MAX: ${this.ns.formatNumber(maxMoney)} CUR: ${this.ns.formatNumber(curMoney)}`);
    const growth = this.ns.growthAnalyze(target, maxMoney / curMoney);
    this.log.log(`Growth Analyze: ${target} G: ${growth}`);
    return Math.ceil(growth);
  }

}

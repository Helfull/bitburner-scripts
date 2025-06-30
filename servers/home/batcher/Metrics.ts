import { Logger } from '../tools/logger';

export class MetricError extends Error {
  public data?: Record<string, any>;

  constructor(message: string, data?: Record<string, any>) {
    super(message + (data ? `: ${JSON.stringify(data)}` : ''));
    this.name = this.constructor.name;
    this.data = data;
  }
}

export interface PrepMetrics {
  times: Omit<BatchData, 'hack'>;
  threads: Omit<BatchData, 'hack'>;
  ends: Omit<BatchData, 'hack'>;
}

export interface MetricsData {
  maxMoney: number;
  curMoney: number;

  minSec: number;
  sec: number;
  greed: number;
  threads: BatchData;
}

export interface BatchData {
  hack: number;
  weaken: number;
  grow: number;
  weakenGrow: number;
}

export const SEC_DEC_WKN = 0.05;
export const SEC_INC_HCK = 0.002;
export const SEC_INC_GRW = 0.004;

export const ERROR_MARGIN = 0.0000001;

export class Metrics {
  constructor(
    private readonly ns: NS,
    private readonly bufferDelay = 20,
    private readonly offset = 5,
    private readonly log = new Logger(ns),
  ) {}

  protected calcGrowWeakenThreads(grwThreads: number) {
    return Math.max(Math.ceil((grwThreads * SEC_INC_GRW) / SEC_DEC_WKN), 1);
  }

  protected calcHackWeakenThreads(hckThreads: number) {
    return Math.max(Math.ceil((hckThreads * SEC_INC_HCK) / SEC_DEC_WKN), 1);
  }

  protected calcHackThreads(target: string, amount: number) {
    return Math.max(Math.floor(this.ns.hackAnalyzeThreads(target, amount)), 1);
  }

  protected calcHackGrowThreads(target: string, maxMoney: number, hackPercent: number, hackThreads: number): number {
    return this.calcGrowThreads(target, maxMoney, maxMoney - maxMoney * hackPercent * hackThreads);
  }

  protected calcGrowThreads(target: string, maxMoney: number, currentMoneyAmount: number) {
    return Math.ceil(this.ns.growthAnalyze(target, maxMoney / currentMoneyAmount));
  }

  protected calcThreads(target: string, maxMoney: number, greed: number): BatchData {
    const amount = maxMoney * greed;

    const hackPercent = this.ns.hackAnalyze(target);
    const hackThreads = this.calcHackThreads(target, amount);
    const growThreads = this.calcHackGrowThreads(target, maxMoney, hackPercent, hackThreads);

    const weakenHackThreads = this.calcHackWeakenThreads(hackThreads);
    const weakenGrowThreads = this.calcGrowWeakenThreads(growThreads);

    return {
      hack: hackThreads,
      weaken: weakenHackThreads,
      grow: growThreads,
      weakenGrow: weakenGrowThreads,
    };
  }

  calcBatch(target: string, greed = 0.1, ramLimit: number | false = false): MetricsData {
    this.log.debug('Calculating metricss for %s', target);
    this.log.debug('Greed: %s', greed);

    const maxMoney = this.ns.getServerMaxMoney(target);
    const curMoney = this.ns.getServerMoneyAvailable(target);

    this.log.debug('Max Money: %s', this.ns.formatNumber(maxMoney));
    this.log.debug('Cur Money: %s', this.ns.formatNumber(curMoney));

    const minSec = this.ns.getServerMinSecurityLevel(target);
    const sec = this.ns.getServerSecurityLevel(target);

    const threads = this.calcThreads(target, maxMoney, greed);

    return {
      curMoney,
      maxMoney,

      minSec,
      sec,

      greed,

      threads,
    };
  }
}
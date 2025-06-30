import { isPrepped } from '@/servers/home/batcher/utils';
import { exec, proxy, proxyNs } from '@lib/ram-dodge';
import { getServers } from '@lib/utils';
import { HAS_ADMIN_ACCESS, HAS_AVAILABLE_RAM, HAS_RAM_AVAILABLE, IS_NOT_HOME } from '@/servers/home/server/filter';
import { BY_RAM_USAGE } from '@/servers/home/server/sort';
import { ramAvailable } from '@/servers/home/server/utils';
import { Color } from '@lib/colors';
import { getExecServer } from '@/servers/home/batcher/batcher';

export const SEC_DEC_WKN = 0.05;
export const SEC_INC_HCK = 0.002;
export const SEC_INC_GRW = 0.004;

/**
 * Calculates the metrics for the target server.
 */
export class Server {

  private ns: NS;
  private target: string;

  constructor(ns: NS, target: string) {
    this.ns = ns;
    this.target = target;
  }

  get name(): string {
    return this.target;
  }

  get maxMoney(): number {
    return this.ns.getServerMaxMoney(this.target);
  }

  get currentMoney(): number {
    return this.ns.getServerMoneyAvailable(this.target);
  }

  get deltaMoney(): number {
    return this.maxMoney - this.currentMoney;
  }

  get currentSecurity(): number {
    return this.ns.getServerSecurityLevel(this.target);
  }

  get minSecurity(): number {
    return this.ns.getServerMinSecurityLevel(this.target);
  }

  get deltaSecurity(): number {
    return this.currentSecurity - this.minSecurity;
  }

  get isPrepped(): boolean {
    return this.isMaxMoney && this.isMinDifficulty;
  }

  get isMaxMoney(): boolean {
    return this.currentMoney === this.maxMoney;
  }

  get isMinDifficulty(): boolean {
    return this.currentSecurity === this.minSecurity;
  }

  get maxRam(): number {
    return this.ns.getServerMaxRam(this.target);
  }

  get usedRam(): number {
    return this.ns.getServerUsedRam(this.target);
  }

  get availableRam(): number {
    return this.maxRam - this.usedRam;
  }

}

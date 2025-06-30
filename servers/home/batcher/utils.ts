import { Statistics } from '@/servers/home/batcher/statistics';

export function isPrepped(ns: NS, target: string): boolean {
    return isMaxMoney(ns, target) && isMinDifficulty(ns, target);
}

export function isMaxMoney(ns: NS, target: string): boolean {
    return ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target);
}

export function isMinDifficulty(ns: NS, target: string): boolean {
    return ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target);
}

export function writeStatistics(ns: NS, statistics: Statistics, visualizerPort: number): void {
  ns.tryWritePort(visualizerPort, JSON.stringify(statistics));
}
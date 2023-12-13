import { NS } from '@ns';
import { Metrics } from 'batcher/Metrics';

export async function main(ns:NS) {
  const flags = ns.flags([
    ['target', ''],
  ]);

  const target = flags.target as string || (flags['_'] as string[])[0] as string;

  const metrics = new Metrics(ns);
  const prepMetrics = metrics.calcPrep(target);

  const monPercent = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target);
  ns.tprintf('INFO | Target: %s', target);
  ns.tprintf('INFO | Min security: %s', ns.getServerMinSecurityLevel(target));
  ns.tprintf('INFO | Current security: %s', ns.getServerSecurityLevel(target));
  ns.tprintf('INFO | Max money: %s', ns.formatNumber(ns.getServerMaxMoney(target)));
  ns.tprintf('INFO | Available money: %s', ns.formatNumber(ns.getServerMoneyAvailable(target)));
  ns.tprintf('INFO | Money percent: %s (%s)', ns.formatPercent(monPercent), monPercent);

  if (prepMetrics.wknThreads > 0) {
    ns.tprintf('WARN | Target is not soft!');
    ns.exec('scripts/batch/weaken.js', 'home', prepMetrics.wknThreads, 0, target);
  }

  if (prepMetrics.grwThreads > 0) {
    ns.tprintf('WARN | Target is not grown!');
    ns.exec('scripts/batch/grow.js', 'home', prepMetrics.grwThreads, ns.getWeakenTime(target), target);
    ns.exec('scripts/batch/weaken.js', 'home', prepMetrics.grwWknThreads, ns.getWeakenTime(target) + ns.getGrowTime(target), target);
  }

  ns.tprintf('INFO | Finished prep');
  const batchMetrics = metrics.calcBatch(target);
  ns.tprintf('INFO | Batch Metrics: %s', JSON.stringify(batchMetrics));
}


import { proxy, proxyNs } from '@lib/ram-dodge';

export async function main(ns: NS) {

  ns.clearLog();

  const target = 'foodnstuff';

  const maxMoney = 50_000_000;
  const currentMoneyAmount = 2_000_000;

  const threadsGrow = Math.ceil(ns.growthAnalyze(target, maxMoney / currentMoneyAmount));

  const ramRequired = ns.getScriptRam('ttt.js', 'home');

  ns.print(`Threads required to grow ${target} from ${ns.formatNumber(currentMoneyAmount)} to ${ns.formatNumber(maxMoney)}: ${threadsGrow}`);
  ns.print(`RAM required to run ttt.js: ${ns.formatRam(ramRequired)}`);
  ns.print(`Total RAM required: ${ns.formatRam(ramRequired * threadsGrow)}`);
}
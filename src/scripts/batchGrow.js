/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  
  const monMax = ns.getServerMaxMoney(target)
  const monAvailable = ns.getServerMoneyAvailable(target)
  ns.tprintf(
    "%s / %s => %s, %s",
    ns.formatNumber(monMax),
    ns.formatNumber(monAvailable),
    monMax/monAvailable,
    Math.ceil(Math.log(monAvailable, monMax/monAvailable))
  );
}
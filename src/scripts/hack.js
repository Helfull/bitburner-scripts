/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  while(true) {
    if (ns.getServerMaxMoney(target) <= ns.getServerMoneyAvailable(target)) {
      await ns.hack(target); 
    }
    await ns.asleep(5000)
  }
}
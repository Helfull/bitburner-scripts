/** @param {NS} ns */
export async function main(ns) {  
  for (let i = 1; i < 20; i++) {
    ns.tprintf("%s -> %s",
      ns.formatRam(Math.pow(2, i)).padStart(10),
      ns.formatNumber(ns.getPurchasedServerCost(Math.pow(2, i))).toString().padStart(10)
    )
  }
}
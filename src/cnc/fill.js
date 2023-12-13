import { pServerPrefix } from 'cnc/lib.js'

/** @param {NS} ns */
export async function main(ns) {
  const settings = JSON.parse(ns.args[0].replace("'", '"'))

  while(ns.getPurchasedServerLimit() > ns.getPurchasedServers().length) {
    ns.printf("Money Req: %s", ns.formatNumber(ns.getPurchasedServerCost(settings.startram)))
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(settings.startram)) {
      const slaveName = pServerPrefix+ns.getPurchasedServers().length;
      ns.purchaseServer(slaveName, settings.startram)
      ns.exec('cnc/target.js', ns.getHostname(), 1, slaveName, JSON.stringify(settings).replace('"', "'"));
      ns.toast("New Server " + slaveName, "success")
    }

    if (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(settings.startram)) {
      await ns.asleep(10000)
    }
  }
}
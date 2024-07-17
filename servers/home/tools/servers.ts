import { Server } from "../../../NetscriptDefinitions";
import { setupDefault } from "../cnc/lib";
import { config } from "../config";
import { Logger } from "./logger";

let log = null;

export async function main(ns: NS) {
  const args = setupDefault(ns, [
    ['upgrade', false],
    ['purchase', false],
    ['loop', false],
  ]);

  const doAll = !args.upgrade && !args.purchase;
  log = new Logger(ns, 'tprintf');

  do {
    const pServers = ns.getPurchasedServers()
    log.log(`Purchased servers: ${pServers.length}`);
    if (doAll || args.upgrade) {
      for (const hostname of pServers) {
        const server = ns.getServer(hostname);
        let curTier: number|string = Math.log(server.maxRam) / Math.log(2);

        const nextUpgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, Math.pow(2, curTier + 1));

        if (curTier >= config.maxRamTier) {
          curTier = 'MAX';
        }

        log.info(`Server: ${server.hostname} (${ns.formatRam(server.maxRam)}, ${curTier}, ${ns.formatNumber(nextUpgradeCost)})`);

        if (server.maxRam < Math.pow(2, config.maxRamTier)) {
          upgradeServer(ns, server);
        }
      }
    }

    if (doAll || args.purchase) {
      const purchaseableMaxTier = getMaxTierPurchaseable(ns);

      log.log(`Max tier purchaseable: ${purchaseableMaxTier.maxTier} (${ns.formatNumber(purchaseableMaxTier.cost)})`);

      ns.purchaseServer(getNextServerName(ns), Math.pow(2, purchaseableMaxTier.maxTier));
    }

    if (args.loop) {
      await ns.sleep(1000);
    }
  } while (args.loop);
}

function getNextServerName(ns: NS) {
  return `${config.prefixPrivate}${ns.getPurchasedServers().length + 1}`;
}

function upgradeServer(ns: NS, server: Server) {
  let maxTier = config.maxRamTier;

  while (server.maxRam < Math.pow(2, maxTier) && maxTier > 1) {
    const upgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, Math.pow(2, maxTier));
    if (upgradeCost <= ns.getServerMoneyAvailable('home')) {
      break;
    }
    maxTier--;
  }

  if (server.maxRam >= Math.pow(2, maxTier) || maxTier < 1) return false;

  log.log(`Upgrading server: ${server.hostname} (${ns.formatRam(server.maxRam)} to ${ns.formatRam(Math.pow(2, maxTier))})`);
  return ns.upgradePurchasedServer(server.hostname, Math.pow(2, maxTier));
}

function getMaxTierPurchaseable(ns: NS) {

  let maxTier = 1;

  while (ns.getPurchasedServerCost(Math.pow(2, maxTier + 1)) < ns.getServerMoneyAvailable('home') || maxTier >= config.maxRamTier) {
    maxTier++;
  }

  return {maxTier, cost: ns.getPurchasedServerCost(Math.pow(2, maxTier))};

}
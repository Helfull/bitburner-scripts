import { defineScript } from '@/servers/home/lib/flags';
import { Server } from '../../../NetscriptDefinitions';
import { setupDefault } from '../cnc/lib';
import { config } from '../config';
import { Logger } from './logger';
import { proxyNs } from '@lib/ram-dodge';

export async function main(ns: NS) {
  const { flags, args } = defineScript(ns, {
    description: 'Manages private server farm upgrade and purchase',
    flags: {
      upgrade: { description: 'Try to upgrade current servers to highest purchaseable tier.', defaultValue: false },
      purchase: {
        description: 'Try to purchase the highest purchaseable tier possible for X servers',
        defaultValue: config.privateServers.maxCount,
      },
      loop: {
        description:
          'Loop the whole time until finished, No more servers need upgrades and/or all servers have been bought',
        defaultValue: false,
      },
      debug: { description: 'Enable debug logging', defaultValue: false },
      cli: { description: 'Use CLI output instead of tprintf', defaultValue: false },
    },
  });

  const log = new Logger(ns, {
    outputFunction: flags.cli ? 'tprintf' : 'printf',
  });

  const purchaseServers = flags.purchase > 0 || flags.purchase === -1;
  const doAll = !flags.upgrade && !purchaseServers;

  log.debug('Args: %s', JSON.stringify(flags));
  log.debug('Purchase servers: %s', purchaseServers);
  log.debug('Upgrade servers: %s', flags.upgrade);
  log.debug('Do all: %s', doAll);

  const manager = new ServerManager(ns, log);

  await manager.updateServers();

  manager.maxServersLimit = flags.purchase;
  manager.doPurchaseServers = doAll || purchaseServers;
  manager.doUpgradeServers = doAll || flags.upgrade;

  do {
    const pServers = await proxyNs(ns, 'getPurchasedServers');
    log.log(`Purchased servers: ${pServers.length}`);
    log.log(`Max servers: ${manager.maxServersLimit}`);

    log.debug('finished %s', manager.finished ? 'Yes' : 'No');
    log.debug('hitServersLimit %s', manager.hitServersLimit ? 'Yes' : 'No');
    log.debug('serversAreMaxed %s', manager.serversAreMaxed ? 'Yes' : 'No');

    log.debug('doPurchaseServers %s', manager.doPurchaseServers ? 'Yes' : 'No');
    log.debug('doUpgradeServers %s', manager.doUpgradeServers ? 'Yes' : 'No');

    await manager.tryUpgradeServers();
    await manager.tryPurchaseServer();

    if (flags.loop) {
      await ns.sleep(1000);
    }

    await manager.updateServers();
  } while (flags.loop && !manager.finished);

  log.info(`Finished managing servers.`);
}

class ServerManager {
  protected servers: string[] = [];

  protected maxedServersCount = 0;

  protected serversLimit = 0;

  public doPurchaseServers = true;
  public doUpgradeServers = true;

  constructor(private ns: NS, private log: Logger) {
    this.serversLimit = this.ns.getPurchasedServerLimit();
  }

  get maxServersLimit() {
    return this.serversLimit;
  }

  set maxServersLimit(limit: number) {
    if (limit === -1 || limit > this.ns.getPurchasedServerLimit()) {
      limit = this.ns.getPurchasedServerLimit();
    }

    this.serversLimit = limit;
  }

  get hitServersLimit() {
    return this.servers.length >= this.serversLimit || this.servers.length >= this.ns.getPurchasedServerLimit();
  }

  get serversAreMaxed() {
    return this.maxedServersCount >= this.servers.length;
  }

  get finished() {
    if (this.doPurchaseServers && !this.hitServersLimit) return false;
    if (this.doUpgradeServers && !this.serversAreMaxed) return false;

    return true;
  }

  async updateServers() {
    this.servers = await proxyNs(this.ns, 'getPurchasedServers');

    if (this.servers === 0) {
      this.log.warn('No purchased servers found. Please purchase at least one server to manage.');
      this.servers = [];
    }
  }

  async tryPurchaseServer() {
    if (this.hitServersLimit) return;

    this.log.log('Trying to purchase another server');

    const purchaseableMaxTier = this.getMaxTierPurchaseable();

    this.log.log(
      `Max tier purchaseable: ${purchaseableMaxTier.maxTier} (${this.ns.formatNumber(purchaseableMaxTier.cost)})`,
    );

    const serverName = await proxyNs(this.ns, 'purchaseServer', await this.getNextServerName(), Math.pow(2, purchaseableMaxTier.maxTier));

    if (serverName === '') {
      this.log.error(JSON.stringify({
        message: 'Failed to purchase server',
        maxTier: purchaseableMaxTier.maxTier,
        cost: this.ns.formatNumber(purchaseableMaxTier.cost),
        availableMoney: this.ns.formatNumber(this.ns.getServerMoneyAvailable('home')),
      }, null, 2))
    }
  }

  async tryUpgradeServers() {
    if (this.serversAreMaxed) return;

    this.maxedServersCount = 0;

    this.log.info(JSON.stringify(this.servers));

    this.log.log('Trying to upgrade servers');
    for (const hostname of this.servers) {
      const server = await proxyNs(this.ns, 'getServer', hostname);
      let curTier: number | string = Math.log(server.maxRam) / Math.log(2);

      const nextUpgradeCost = await proxyNs(this.ns, 'getPurchasedServerUpgradeCost', server.hostname, Math.pow(2, curTier + 1));

      if (curTier >= config.maxRamTier) {
        curTier = 'MAX';
        this.maxedServersCount++;
      }

      this.log.info(
        `Server: ${server.hostname} (${this.ns.formatRam(server.maxRam)}, ${curTier}, ${this.ns.formatNumber(
          nextUpgradeCost,
        )})`,
      );

      if (server.maxRam < Math.pow(2, config.maxRamTier)) {
        this.upgradeServer(server);
      }
    }
  }

  async getNextServerName() {
    return `${config.prefixPrivate}${(await proxyNs(this.ns, 'getPurchasedServers')).length + 1}`;
  }

  upgradeServer(server: Server) {
    let maxTier = config.maxRamTier;

    while (server.maxRam < Math.pow(2, maxTier) && maxTier > 1) {
      this.log.info(`Checking upgrade cost for ${server.hostname} to ${Math.pow(2, maxTier)}`);
      const upgradeCost = this.ns.getPurchasedServerUpgradeCost(server.hostname, Math.pow(2, maxTier));
      if (upgradeCost <= this.ns.getServerMoneyAvailable('home')) {
        break;
      }
      maxTier--;
    }

    if (server.maxRam >= Math.pow(2, maxTier) || maxTier < 1) return false;

    this.log.info(
      `Upgrading server: ${server.hostname} (${this.ns.formatRam(server.maxRam)} to ${this.ns.formatRam(
        Math.pow(2, maxTier),
      )})`,
    );
    return this.ns.upgradePurchasedServer(server.hostname, Math.pow(2, maxTier));
  }

  getMaxTierPurchaseable() {
    let maxTier = 1;

    while (
      this.ns.getPurchasedServerCost(Math.pow(2, maxTier + 1)) < this.ns.getServerMoneyAvailable('home') &&
      maxTier <= config.maxRamTier
    ) {
      maxTier++;
    }

    return { maxTier, cost: this.ns.getPurchasedServerCost(Math.pow(2, maxTier)) };
  }
}

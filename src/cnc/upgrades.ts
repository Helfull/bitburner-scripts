import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([
    ['ram', 0],
  ]);

  for (const slave of ns.getPurchasedServers()) {
    const targetRAM = flags.ram as number || (ns.getServerMaxRam(slave) * 2);

    if (ns.getServerMaxRam(slave) >= targetRAM) {
      ns.tprintf('INFO | Server %s already has %s RAM', slave, ns.formatRam(targetRAM));
      continue;
    }

    const upgradeCost = ns.getPurchasedServerUpgradeCost(slave, targetRAM)
    const playerMoney = ns.getServerMoneyAvailable("home")
    if (playerMoney > upgradeCost) {
      ns.upgradePurchasedServer(slave, targetRAM)
      ns.tprintf(ns.sprintf('SUCCESS | Upgraded Server %s to %s', slave, ns.formatRam(targetRAM)));
    } else {
      ns.tprintf(ns.sprintf('WARN | Not enough money to upgrade %s to %s', slave, ns.formatRam(targetRAM)));
    }
  }
}
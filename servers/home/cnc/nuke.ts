import { Server } from "../../../NetscriptDefinitions";
import { checkVirus } from "../tools/purchaseProgram";

export async function tryPurchaseVirus(ns: NS, virus: string): Promise<boolean> {
  const pid = ns.run('tools/purchaseProgram.js', 1, '--viruses', virus);

  while (ns.isRunning(pid)) {
    await ns.sleep(100);
  }

  return checkVirus(ns, virus);
}

export async function nuke(ns: NS, server: Server): Promise<boolean> {

  await ftpPortOpen(ns, server);
  await sqlPortOpen(ns, server);
  await httpPortOpen(ns, server);
  await sshPortOpen(ns, server);
  await smtpPortOpen(ns, server);

  if (!server.hasAdminRights) {
    if ((server.numOpenPortsRequired ?? 0) > (server.openPortCount ?? 0)) {
      return false;
    }

    try {
      ns.nuke(server.hostname);
    } catch (e) {
      return false;
    }

  }

  return true;
}

export async function ftpPortOpen(ns: NS, server: Server) {
  if (!server.ftpPortOpen && await tryPurchaseVirus(ns, 'FTPCrack.exe')) {
    ns.ftpcrack(server.hostname);
  }
}

export async function sqlPortOpen(ns: NS, server: Server) {
  if (!server.sqlPortOpen && await tryPurchaseVirus(ns, 'SQLInject.exe')) {
    ns.sqlinject(server.hostname);
  }
}

export async function httpPortOpen(ns: NS, server: Server) {
  if (!server.httpPortOpen && await tryPurchaseVirus(ns, 'HTTPWorm.exe')) {
    ns.httpworm(server.hostname);
  }
}

export async function sshPortOpen(ns: NS, server: Server) {
  if (!server.sshPortOpen && await tryPurchaseVirus(ns, 'BruteSSH.exe')) {
    ns.brutessh(server.hostname);
  }
}

export async function smtpPortOpen(ns: NS, server: Server) {
  if (!server.smtpPortOpen && await tryPurchaseVirus(ns, 'relaySMTP.exe')) {
    ns.relaysmtp(server.hostname);
  }
}

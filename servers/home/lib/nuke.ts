import { Server } from "../../../NetscriptDefinitions";

export function checkVirus(ns: NS, virus: string) {
  if (!ns.fileExists(virus, 'home')) {
    return false;
  }
  return true;
}

export function tryPurchaseVirus(ns: NS, virus: string): boolean {
  if (checkVirus(ns, virus)) return true;
/*

  try {
    ns.singularity.purchaseProgram(virus);
    return true;
  } catch (e) {

    if (e.includes('This singularity function requires Source-File 4 to run')) {
      ns.printf(`ERROR | Cannot purchase ${virus} because Source-File 4 is required.`);
      return false;
    }
*/

    return false;
/*  }*/
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
  if (!server.ftpPortOpen && tryPurchaseVirus(ns, 'FTPCrack.exe')) {
    ns.ftpcrack(server.hostname);
  }
}

export async function sqlPortOpen(ns: NS, server: Server) {
  if (!server.sqlPortOpen && tryPurchaseVirus(ns, 'SQLInject.exe')) {
    ns.sqlinject(server.hostname);
  }
}

export async function httpPortOpen(ns: NS, server: Server) {
  if (!server.httpPortOpen && tryPurchaseVirus(ns, 'HTTPWorm.exe')) {
    ns.httpworm(server.hostname);
  }
}

export async function sshPortOpen(ns: NS, server: Server) {
  if (!server.sshPortOpen && tryPurchaseVirus(ns, 'BruteSSH.exe')) {
    ns.brutessh(server.hostname);
  }
}

export async function smtpPortOpen(ns: NS, server: Server) {
  if (!server.smtpPortOpen && await tryPurchaseVirus(ns, 'relaySMTP.exe')) {
    ns.relaysmtp(server.hostname);
  }
}

import { _ } from 'cli-colors.js';
import * as colors from 'cli-colors.js';

/** @param {NS} ns */
export async function main(ns) {
  const slave = ns.args[0];

  if (ns.hasRootAccess(slave)) { return; }

  const maxLevel = [
    ns.fileExists("BruteSSH.exe") ? 1 : 0,
    ns.fileExists("FTPCrack.exe") ? 1 : 0,
    ns.fileExists("HTTPWorm.exe") ? 1 : 0,
    ns.fileExists("SQLInject.exe") ? 1 : 0,
    ns.fileExists("relaySMTP.exe") ? 1 : 0,
  ].reduce((prev, cur) => prev + cur, 0)

  if(ns.getServerNumPortsRequired(slave) > maxLevel) {
    ns.tprint("Ports required: " + ns.getServerNumPortsRequired(slave))
    ns.tprint("Can open: " + maxLevel)
    ns.tprint(_(colors.FRED, "Need more ports!"))
    return;
  }

  if(ns.fileExists("BruteSSH.exe")) {
    ns.print(_(colors.FGREEN, "SSH Port opened!"))
    ns.brutessh(slave);
  }

  if(ns.fileExists("FTPCrack.exe")) {
    ns.print(_(colors.FGREEN, "FTP Port opened!"))
    ns.ftpcrack(slave);
  }

  if(ns.fileExists("HTTPWorm.exe")) {
    ns.print(_(colors.FGREEN, "HTTP Port opened!"))
    ns.httpworm(slave);
  }

  if(ns.fileExists("SQLInject.exe")) {
    ns.print(_(colors.FGREEN, "SQL Port opened!"))
    ns.sqlinject(slave);
  }

  if(ns.fileExists("relaySMTP.exe")) {
    ns.print(_(colors.FGREEN, "SMTP Port opened!"))
    ns.relaysmtp(slave);
  }

  ns.tprintf('Nuked %s!', slave);
  ns.nuke(slave);
}
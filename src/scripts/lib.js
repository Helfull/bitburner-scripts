
/** @param {NS} ns */
export function hackablePortCount(ns) {
  return [
    ns.fileExists("BruteSSH.exe", "home") ? 1 : 0,
    ns.fileExists("FTPCrack.exe", "home") ? 1 : 0,
    ns.fileExists("HTTPWorm.exe", "home") ? 1 : 0,
    ns.fileExists("SQLInject.exe", "home") ? 1 : 0,
    ns.fileExists("relaySMTP.exe", "home") ? 1 : 0,
  ].reduce((prev, cur) => prev + cur, 0)
}
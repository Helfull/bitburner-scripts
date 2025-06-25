/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const delay = ns.args[1]
  await ns.grow(target, {additionalMsec: delay})
}
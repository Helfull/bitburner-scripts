/** @param {NS} ns */
export async function main(ns) {
  const scripts = ns.ls('home', 'scripts');

  const target = ns.args[0];
  ns.print(scripts);
  ns.scp(scripts, target, 'home');
}
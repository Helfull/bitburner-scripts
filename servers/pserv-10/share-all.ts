export async function main(ns: NS) {
  const ram = ns.getServerMaxRam('pserv-10') - ns.getServerUsedRam('pserv-10');
  ns.print(`Max RAM on pserv-10: ${ns.formatRam(ram)}`);
  const threads = Math.floor(ram / ns.getScriptRam('share.js'));
  ns.tprint(`Starting share on pserv-10 with ${threads} threads.`);

  while(true) {
    const pid = ns.exec('share.js', 'pserv-10', threads);

    while(ns.isRunning(pid)) {
      await ns.sleep(1000);
    }
  }
}

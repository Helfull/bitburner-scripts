export async function main(ns: NS) {
  const requiredRam = ns.args[0] as number;
  const waitForRam = ns.args[1];
  let result = findServer(ns, requiredRam);

  while (waitForRam === '--wait' && result === false) {
    await ns.sleep(100); // Wait for 1 second before checking again
    result = findServer(ns, requiredRam);
  }

  ns.atExit(async () => {
    ns.getPortHandle(ns.pid).write(result);
  });
}

function findServer(ns: NS, requiredRam: number): string|false {
  const serverList = new Set(["home"])
  for (const server of serverList) {
    for (const connection of ns.scan(server)) {
      serverList.add(connection);
      if (connection === "home") continue; // Skip home server to avoid infinite loop
      if (!ns.hasRootAccess(server)) continue;
      const serverRam = ns.getServerMaxRam(connection) - ns.getServerUsedRam(connection);
      if (serverRam >= requiredRam) {
        return connection;
      }
    }
  }

  if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") >= requiredRam) {
    return "home";
  }

  return false;
}
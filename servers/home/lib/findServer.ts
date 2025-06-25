export async function main(ns: NS) {
  const requiredRam = ns.args[0] as number;
  const result = findServer(ns, requiredRam);
  ns.atExit(async () => {
    ns.getPortHandle(ns.pid).write(result);
  });
}

function findServer(ns: NS, requiredRam: number): string|false {
  if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") >= requiredRam) {
    return "home";
  }
  const serverList = new Set(["home"])
  for (const server of serverList) {
    for (const connection of ns.scan(server)) {
      serverList.add(connection);
      if (!ns.hasRootAccess(server)) continue;
      const serverRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      if (serverRam >= requiredRam) {
        return server;
      }
    }
  }
  return false;
}
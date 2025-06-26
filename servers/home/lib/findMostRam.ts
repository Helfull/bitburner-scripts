export async function main(ns: NS) {
  const result = findServer(ns);
  ns.atExit(async () => {
    ns.getPortHandle(ns.pid).write(result);
  });
}

function findServer(ns: NS): [string, number] {
  const serverList = new Set(["home"])

  let mostRamServer = "home";
  let mostRam = 0;

  for (const server of serverList) {
    for (const connection of ns.scan(server)) {
      serverList.add(connection);
      if (connection === "home") continue; // Skip home server to avoid infinite loop
      if (!ns.hasRootAccess(connection)) continue;
      const connectionRam = ns.getServerMaxRam(connection) - ns.getServerUsedRam(connection);
      if (connectionRam > mostRam) {
        mostRamServer = connection;
        mostRam = connectionRam;
      }
    }
  }

  if (mostRam === 0) {
    mostRamServer = "home";
    mostRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  }

  return [mostRamServer, mostRam];
}
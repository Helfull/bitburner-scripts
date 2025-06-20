import { getServers, setupDefault } from '@/servers/home/cnc/lib';

export function main(ns: NS) {
  const args = setupDefault<{ scriptName: string[] }>(ns, [['scriptName', []]]);
  getServers(ns).forEach((server) => {
    if (args.scriptName.length > 0) {
      args.scriptName.forEach((scriptName) => {
        ns.scriptKill(scriptName, server);
      });
      return;
    }
    ns.killall(server, true);
  });
}

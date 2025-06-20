import { getServers, setupDefault } from '@/servers/home/cnc/lib';

export function main(ns: NS) {
  const args = setupDefault<{ scriptName: string[] }>(ns, [['scriptName', []]]);
  getServers(ns).forEach((server) => {
    ns.killall(server, true);
  });
}

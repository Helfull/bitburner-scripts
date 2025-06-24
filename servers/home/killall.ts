import { getServers, setupDefault } from '@lib/utils';

export function main(ns: NS) {
  const args = setupDefault<{ scriptName: string[] }>(ns, [['scriptName', []]]);
  getServers(ns).forEach((server) => {
    ns.killall(server, true);
  });
}

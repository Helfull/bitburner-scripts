import { setupDefault } from '@lib/utils';
import { config } from '@/servers/home/config';
import { StartUpUtil } from '@/servers/home/startup-tools/util';

export async function main(ns: NS)
{
  const args = setupDefault(ns);

  const startUp = new StartUpUtil(ns);

  await startUp.start(ns, 'tools/servers.js', '--loop', '--purchase=1');

  await startUp.idle(() => {
    startUp.logger.info(`Waiting for purchased servers to be available`);
    startUp.logger.info(`Purchased servers: ${ns.getPurchasedServers().length}`);
    return ns.getPurchasedServers().length > 0;
  });

  await startUp.start(ns, 'tools/servers.js', '--loop', '--upgrade');

  await startUp.start(ns, 'prep.js', 'n00dles');

  startUp.logger.info('Waiting for private server or enough home server RAM');

  await startUp.idle(() => {
    startUp.logger.info(`Checking for private server or home server RAM`);
    startUp.logger.info(`Purchased servers: ${ns.getPurchasedServers().length}`);
    return ns.getServerMaxRam(`${config.prefixPrivate}1`) >= 64;
  });

  await startUp.start(ns, 'prep-net.js');
}
import { StartUpUtil } from '@/servers/home/startup-tools/util';

export async function main(ns: NS)
{
  const startUp = new StartUpUtil(ns);
  startUp.logger.info('Waiting for stock and tix api access and at least 10M on home server');
  await startUp.idle(() => ns.getServerMoneyAvailable('home') > 10_000_000);
  await startUp.start(ns, 'imported/mystocks.js', 'hybrid');

}
import { setupDefault } from './cnc/lib';
import { StartUpUtil } from '@/servers/home/startup-tools/util';

export async function main(ns: NS)
{
  ns.tprint('Starting up home scripts');

  const args = setupDefault(ns);

  const startUp = new StartUpUtil(ns);

  startUp.logger.info('Starting up scripts');

  await startUp.start(ns, 'nuke-net.js');

  await startUp.start(ns, 'hack-net.js', '--loop');

  await startUp.start(ns, 'share-on-idle.js');

  startUp.startScript('startup-tools/servers.starter.js');

  startUp.startScript('startup-tools/stock.starter.js');

  // startUp.startScript('startup-tools/ui.starter.js');
}


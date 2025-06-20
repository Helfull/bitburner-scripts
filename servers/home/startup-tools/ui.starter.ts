import { getLogger, start, StartUpUtil } from '@/servers/home/startup-tools/util';

export async function main(ns: NS)
{
  await (new StartUpUtil(ns)).start(ns, 'cnc/ui.js');
}
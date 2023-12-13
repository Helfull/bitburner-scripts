import { NS } from '@ns';
import { Logger } from 'lib/logger';

export async function main(ns: NS) {
  const delay = ns.args[0] as number;
  const target = ns.args[1] as string;
  const logger = new Logger(ns, ns.sprintf('WORKER %s', target));

  await ns.hack(target, {
    additionalMsec: Math.max(0, delay)
  });

  logger.info(ns.sprintf('%s => Hacked %s', ns.args[2], target));
}
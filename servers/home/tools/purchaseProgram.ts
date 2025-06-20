import { setupDefault } from '../cnc/lib';
import { Logger } from '@/servers/home/tools/logger';
import { defineScript } from '@lib/flags';

export function checkVirus(ns: NS, virus: string) {
  if (!ns.fileExists(virus, 'home')) {
    return false;
  }
  return true;
}

export function tryPurchaseVirus(ns: NS, virus: string): boolean {
  if (checkVirus(ns, virus)) return true;

  try {
    ns.singularity.purchaseProgram(virus);
    return true;
  } catch (e) {

    if (e.includes('This singularity function requires Source-File 4 to run')) {
      ns.printf(`ERROR | Cannot purchase ${virus} because Source-File 4 is required.`);
      return false;
    }

    return false;
  }
}

export async function main(ns: NS) {
    const args = defineScript(ns, {
    description: 'Manages private server farm upgrade and purchase',
    flags: {
      viruses: {
        description: 'Try to upgrade current servers to highest purchaseable tier.',
        defaultValue: [
          'BruteSSH.exe',
          'FTPCrack.exe',
          'relaySMTP.exe',
          'HTTPWorm.exe',
          'SQLInject.exe',
          'DeepscanV1.exe',
          'DeepscanV2.exe',
          'AutoLink.exe',
        ],
        options: [],
      },
    },
  });

  const logger = new Logger(ns);

  logger.info(`Starting virus purchase script with viruses: ${args.viruses.join(', ')}`);

  for (const virus of args.viruses) {
    logger.info(`Checking and trying to purchase virus: ${virus}`);
    const purchased = tryPurchaseVirus(ns, virus);
    if (purchased) {
      logger.success(`Successfully purchased virus: ${virus}`);
    } else {
      logger.error(`Failed to purchase virus: ${virus}`);
    }
  }
}

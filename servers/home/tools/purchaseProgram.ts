import { Logger } from '@/servers/home/tools/logger';
import { defineScript } from '@lib/flags';
import { Programs } from '@lib/enums';
import { tryPurchaseVirus } from '@lib/nuke';


export async function main(ns: NS) {
    const args = defineScript(ns, {
    description: 'Manages private server farm upgrade and purchase',
    flags: {
      viruses: {
        description: 'Try to upgrade current servers to highest purchaseable tier.',
        defaultValue: Object.keys(Programs).map((program) => Programs[program as keyof typeof Programs]),
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

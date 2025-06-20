import { defineScript } from '@lib/flags';
import { setupDefault } from '../../cnc/lib';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Hack a target server until it has no money',
    flags: {
      target: {
        description: 'The target server to hack',
        defaultValue: '',
      },
    },
  });

  if (args.target === '') {
    ns.tprint('ERROR | No target specified');
    return;
  }

  while (ns.getServerMoneyAvailable(args.target) > 0) {
    await ns.hack(args.target);
  }
}

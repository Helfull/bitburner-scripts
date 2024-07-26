import { defineScript } from '@lib/flags';
import { setupDefault } from '../../cnc/lib';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Grow a target server until it is at its maximum money',
    flags: {
      target: {
        description: 'The target server to grow',
        defaultValue: '',
      },
    },
  });

  if (args.target === '') {
    ns.tprint('ERROR | No target specified');
    return;
  }

  while (ns.getServerMoneyAvailable(args.target) < ns.getServerMaxMoney(args.target)) {
    await ns.grow(args.target);
  }
}

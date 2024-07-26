import { defineScript } from '@lib/flags';

export async function main(ns: NS) {
  const args = defineScript(ns, {
    description: 'Weaken a target server until it is at its minimum security level',
    flags: {
      target: {
        description: 'The target server to weaken',
        defaultValue: '',
      },
    },
  });

  if (args.target === '') {
    ns.tprint('ERROR | No target specified');
    return;
  }

  while (ns.getServerSecurityLevel(args.target) > ns.getServerMinSecurityLevel(args.target)) {
    await ns.weaken(args.target);
  }
}

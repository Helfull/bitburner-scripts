import { defineScript } from '@lib/flags';
import { prep } from '@/servers/home/batcher/prepper';

export async function main(ns: NS) {
  const scripts = defineScript(ns, {
    description: 'Prepares a target server for batch attacks',
    args: {
      target: {
        description: 'The target server to prepare',
        defaultValue: 'n00dles',
      }
    }
  });

  ns.print(`Preparing target server: ${scripts.args.target}`);

  await  prep(ns, scripts.args.target);
}
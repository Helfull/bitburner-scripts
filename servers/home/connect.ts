import { connect } from '@/servers/home/server/utils';
import { CommandLineArgs, defineScript } from '@lib/flags';

export async function main(ns: NS) {

  const script = defineScript(ns, {
    description: 'Manages private server farm upgrade and purchase',
    flags: {},
    args: {
      host: {
        description: 'The host to connect to',
        defaultValue: 'home',
      }
    }
  });

  connect(ns, script.args.host);
}

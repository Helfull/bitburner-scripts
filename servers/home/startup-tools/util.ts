import { Logger } from '@/servers/home/tools/logger';

export class StartUpUtil {

  logger: Logger;
  constructor(public ns: NS) {
    this.logger = new Logger(ns);
  }

  async start(ns: NS, script: string, ...args: string[]) {
    if (ns.isRunning(script, 'home', ...args)) {
      this.logger.info(`Already running ${script}`);
      return;
    }

    this.logger.info(`Starting ${script} ${args.join(' ')}`);
    let pid = 0;
    do {
      await ns.sleep(100);
      pid = ns.run(
        script,
        {
          preventDuplicates: true,
          threads: 1,
        },
        ...args,
      );

      if (pid === 0) {
        this.logger.error(`Failed to start ${script}`);
        await ns.sleep(5000);
      }
    } while (pid === 0);

    this.logger.info(`Started ${script} with pid ${pid}`);
  }

  startScript(script: string, ...args: string[]) {
    if (this.ns.isRunning(script, 'home', ...args)) {
      this.logger.info(`Already running ${script}`);
      return;
    }

    this.logger.info(`Starting ${script} ${args.join(' ')}`);
    let pid = 0;

    pid = this.ns.run(
      script,
      {
        preventDuplicates: true,
        threads: 1,
      },
      ...args,
    );

    this.logger.info(`Started ${script} with pid ${pid}`);
  }

  async idle(until: () => boolean) {
    while(!until()) {
      await this.ns.share();
      await this.ns.sleep(1000)
    }
  }
}

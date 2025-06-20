import { printTableObj } from '@lib/table';
import { getServers, setupDefault } from '../cnc/lib';
import { HAS_ADMIN_ACCESS, HAS_MONEY, IS_NOT_HOME, IS_NOT_PRIVATE, IS_PREPPED, NEEDS_PREP } from '../server/filter';
import { BY_WEIGHT } from '../server/sort';
import { Logger } from '../tools/logger';
import { RAMManager } from './RamManager';

export class ProtoManager {
  constructor(protected readonly ns: NS, protected log = new Logger(ns)) {}

  async loop() {
    const protoPids: { server: string; pid: number }[] = [];
    const prepPids: { server: string; pid: number }[] = [];

    while (true) {
      const targets = getServers(this.ns)
        .filter(IS_NOT_HOME(this.ns))
        .filter(IS_NOT_PRIVATE(this.ns))
        .filter(HAS_MONEY(this.ns))
        .filter(HAS_ADMIN_ACCESS(this.ns));

      targets
        .filter(NEEDS_PREP(this.ns))
        .sort(BY_WEIGHT(this.ns))
        .filter((target) => !prepPids.some((p) => p.server === target))
        .forEach((server) => {
          this.log.info(`Prepping ${server}`);
          const pid = this.ns.run('prep.js', 1, server);

          if (pid === 0) {
            this.log.error(`Failed to start prep on ${server}`);
            return;
          }

          prepPids.push({ server, pid });
        });

      const protoTargets = targets.filter(IS_PREPPED(this.ns)).sort(BY_WEIGHT(this.ns)).slice(0, 10);

      // Kill all proto pids that are not in the list of targets
      for (const pid of protoPids) {
        if (!protoTargets.includes(pid.server)) {
          this.log.info(`Killing proto on ${pid.server}`);
          const killed = this.ns.kill(pid.pid);

          if (!killed) this.log.error(`Failed to kill proto on ${pid.server}`);

          protoPids.splice(protoPids.indexOf(pid), 1);
        }
      }

      protoTargets.forEach((server) => {
        if (protoPids.some((p) => p.server === server)) {
          this.log.info(`Already protoing ${server}`);
          return;
        }

        this.log.info(`Protoing ${server}`);
        const pid = this.ns.run('proto-batch.js', 1, server);

        if (pid === 0) {
          this.log.error(`Failed to start proto on ${server}`);
          return;
        }

        protoPids.push({ server, pid });
      });

      console.log(protoPids);
      printTableObj(this.ns, protoPids, this.ns.print);

      await this.ns.sleep(1000);
    }
  }
}

export async function main(ns: NS) {
  setupDefault(ns);
  const proto = new ProtoManager(ns);

  await proto.loop();
}

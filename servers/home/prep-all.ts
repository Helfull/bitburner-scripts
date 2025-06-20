import { getServers, setupDefault, weight } from './cnc/lib';
import { BY_WEIGHT } from './server/sort';
import {
  HAS_ADMIN_ACCESS, HAS_AVAILABLE_RAM,
  HAS_MONEY, HAS_RAM_AVAILABLE,
  IS_HACKABLE,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
  IS_PREPPED,
  NEEDS_PREP,
} from './server/filter';
import { Logger } from '@/servers/home/tools/logger';
import { ramAvailable } from '@/servers/home/server/utils';
import { Color } from '@lib/colors';

export async function main(ns: NS) {
  const logger = new Logger(ns, {
    outputFunction: 'tprintf',
  });
  function filterPrepped(ns: NS, targets: string[]) {
    logger.info(`Filtering prepped servers`);
    targets.filter(IS_PREPPED(ns)).forEach((t) => {
      logger.info(`Prepped ${t} starting proto batch`);
      handToProto(ns, t);
    });

    return targets.filter(NEEDS_PREP(ns));
  }

  function handToProto(ns: NS, target: string) {
    logger.info(`Handing over to proto batcher ${Color.green.wrap(target)}`);
    const pid = ns.run('proto-batch.js', 1, target);

    if (pid === 0) {
      logger.info(`Failed to run proto-batch.js on ${Color.green.wrap(target)}`);
    }

    logger.info(`PID: ${pid}`);

    return pid;
  }

  const preppingPids = [];
  try {
    const args = setupDefault(ns);

    let targets = getServers(ns)
      .filter(IS_NOT_PRIVATE(ns))
      .filter(IS_NOT_HOME(ns))
      .filter(HAS_ADMIN_ACCESS(ns))
      .filter(HAS_MONEY(ns))
      .filter(IS_HACKABLE(ns))
      .sort(BY_WEIGHT(ns));

    ns.ui.setTailTitle(ns.sprintf('Targetting %s', targets.join(', ')));

    while (targets.length > 0) {
      await ns.sleep(100);
      targets = filterPrepped(ns, targets);

      const target = ns.getServer(targets.shift());

      logger.info(`Targetting ${target.hostname}`);
      ns.ui.setTailTitle(ns.sprintf('Targetting %s', target.hostname));

      let runOn = target.hostname;
      if (!HAS_RAM_AVAILABLE(ns)(target.hostname, ns.getScriptRam('prep.js')) || !HAS_ADMIN_ACCESS(ns)(target.hostname)) {
        logger.warn(`Cant run on target ${target.hostname}, searching for script host with ram available, required: ${ns.getScriptRam('prep.js')}`);

        const servers = getServers(ns);

        let potential = [];
        do {
          potential = servers
          .filter(s => HAS_ADMIN_ACCESS(ns)(s))
          .filter(s => HAS_AVAILABLE_RAM(ns)(s, ns.getScriptRam('prep.js')));

          if (potential.length === 0) {
            await ns.sleep(100);
            logger.warn(`No servers with enough ram to run prep.js`);
          }

          await ns.sleep(1000);
        }
        while (potential.length === 0)

        runOn = potential[0];
        logger.info(`Trying to run prep.js on ${runOn} with ${ns.formatRam(ramAvailable(ns, runOn))} available.`);
      }

      logger.info(`Running prep.js on ${runOn} ${ns.formatRam(ns.getServerMaxRam(runOn) - ns.getServerUsedRam(runOn))}`);
      ns.scp('prep.js', runOn, 'home');
      ns.scp('batcher/Prepper.js', runOn, 'home');
      ns.scp('batcher/RamManager.js', runOn, 'home');
      ns.scp('cnc/lib.js', runOn, 'home');

      let pid = ns.exec('prep.js', runOn, { threads: 1, preventDuplicates: true, temporary: true }, target.hostname);

      if (pid === 0) {
        logger.error(`Failed to run prep.js on ${runOn}`);
        continue;
      }

      preppingPids.push({ pid, target });
    }
  } catch (e) {
    logger.error(`Error: ${e}`);
  }

  do
  {
    await ns.share();
    await ns.sleep(1000);

    for (let prep of preppingPids) {
      if (ns.isRunning(prep.pid)) continue;
      handToProto(ns, prep.target.hostname);
      await ns.sleep(100);
    }
  } while((preppingPids.some((prep) => ns.isRunning(prep.pid))))
}



import { defineScript } from '@lib/flags';
import { getServers, weight } from '@lib/utils';
import {
  HAS_ADMIN_ACCESS,
  HAS_MAX_MONEY, HAS_MONEY,
  IS_GOOD_TARGET,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
} from '@/servers/home/server/filter';
import { BY_WEIGHT } from '@/servers/home/server/sort';

export async function main(ns: NS) {
  const script = defineScript(ns, {
    description: 'Prepares the network for batch attacks',

    flags: {
      visualizer: {
        description: 'Enable visualizer for the prep-net script',
        defaultValue: -1,
      }
    }
  });

  let lastTarget = null;
  let prepPid  =  0;
  let farmPid = 0;

  ns.atExit(() => {
    ns.printf('Exiting prep-net script. Cleaning up...');
    if (prepPid > 0 && ns.isRunning(prepPid)) {
      ns.kill(prepPid);
      ns.printf(`Killed prep script with PID ${prepPid}.`);
    }
    if (farmPid > 0 && ns.isRunning(farmPid)) {
      ns.kill(farmPid);
      ns.printf(`Killed farm script with PID ${farmPid}.`);
    }
    ns.printf('Cleanup complete.');
  }, 'cleanup-' + ns.pid);

  while (true) {

    const servers = getServers(ns)
      .filter(IS_NOT_HOME(ns))
      .filter(IS_NOT_PRIVATE(ns))
      .filter(HAS_ADMIN_ACCESS(ns))
      .filter(HAS_MONEY(ns))
      .filter(IS_GOOD_TARGET(ns))
      .sort(BY_WEIGHT(ns));

    if (servers.length === 0) {
      ns.printf('No servers available for preparation. Waiting for 1 minute before checking again.');
      await ns.sleep(60000); // Wait for 1 minute before checking again
      continue;
    }

    ns.clearLog();
    ns.printf(`Found ${servers.length} servers available for preparation.`);
    ns.printf(`Potential targets: ${servers.map(s => `${s} (${ns.formatNumber(weight(ns, s))})`).join(', ')}`);

    const optimalTarget = servers.shift();

    if (optimalTarget) {
      ns.printf(`
Optimal Target: ${optimalTarget ? optimalTarget : 'None'}
Last Target: ${lastTarget ? lastTarget : 'None'}
Prep PID: ${prepPid > 0 ? prepPid : 'None'}
Farm PID: ${farmPid > 0 ? farmPid : 'None'}

Target stats: 
  ${optimalTarget ?? 'No target selected'}
  ${ns.formatNumber(weight(ns, optimalTarget))} Weight
  ${ns.getServerRequiredHackingLevel(optimalTarget)} Required Hacking Level
  ${ns.formatRam(ns.getServerUsedRam(optimalTarget))} / ${ns.formatRam(ns.getServerMaxRam(optimalTarget))} RAM used
  ${ns.formatNumber(ns.getServerMoneyAvailable(optimalTarget))} / ${ns.formatNumber(ns.getServerMaxMoney(optimalTarget))} Money available
      `);
    }


    if  (optimalTarget !== lastTarget && prepPid === 0) {
      ns.printf(`New optimal target found: ${optimalTarget}`);
      ns.ui.setTailTitle(`Optimal target: ${optimalTarget}`);

      // Execute the script on the optimal target
      prepPid = ns.exec('prep.js', 'home', { threads: 1 }, optimalTarget);

      if (prepPid === 0) {
        ns.printf(`Failed to start script on ${optimalTarget}.`);
      } else {
        ns.printf(`Started script with PID ${prepPid} on ${optimalTarget}.`);
        lastTarget = optimalTarget;
      }
    }

    if (prepPid > 0 && !ns.isRunning(prepPid)) {
      ns.printf(`Script with PID ${prepPid} has stopped running.`);
      prepPid = 0; // Reset the PID if the script is no longer running

      if (ns.isRunning(farmPid)) {
        ns.kill(farmPid)
      }

      farmPid = ns.exec('batcher/batcher.js', 'home', { threads: 1 }, lastTarget, script.flags.visualizer);
    }

    ns.printf(`Current optimal target: ${lastTarget || 'None'}`);
    await ns.sleep(1000); // Check every minute
  }
}
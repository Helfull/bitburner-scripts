import * as colors from 'cli-colors.js';
import { _ } from 'cli-colors.js';
import { terminal, wrapCmdNode } from './lib/terminal';

/** @param {NS} ns */
export async function main(ns) {

  const flags = ns.flags([
    ['find', ''],
    ['alias', false],
    ['canBackdoor', false],
    ['process', false],
    ['files', false],
  ])

  const servers = ns.scan().filter(s =>
    !s.startsWith('pserv')
    && s != 'cnc'
    && s != 'home'
  );

  const outServers = [...servers]
  const cmds = []
  for (let i=0; i<servers.length; i++) {
    const neighbors = ns.scan(servers[i]);

    for (const neighbor of neighbors) {
      if (servers.includes(neighbor)) continue;
      if (neighbor.startsWith('pserv-')) continue;
      if (neighbor == 'cnc') continue;
      if (neighbor == 'home') continue;
      servers.push(neighbor)

      const server = ns.getServer(neighbor)
      const root = server.hasAdminRights
      const backdoor = server.backdoorInstalled
      const sColor = backdoor ? colors.FGREEN : (root ? colors.FYELLOW : colors.FWHITE);
      const canBackdoor = ns.getServerRequiredHackingLevel(neighbor) <= ns.getHackingLevel() && !backdoor;

      const neighborStr = _(sColor, neighbor) + (canBackdoor ? ' !!! ' : '');

      outServers.push(str(backdoor, outServers[i],  neighborStr))

      if (flags.canBackdoor && !canBackdoor) continue;
      if (!flags.find || neighbor.includes(flags.find)) {
        ns.tprint(str(backdoor, outServers[i], neighborStr) + `(IP: ${ns.getServer(neighbor).ip}) B: ${ns.getServer(neighbor).backdoorInstalled} R: ${ns.hasRootAccess(neighbor)}`)

        const cmd = colors.stripColors(
          'connect ' + (!backdoor ? outServers[i].split(' -> ').join('; connect ') + '; connect ' : '') +
          neighbor + (canBackdoor ? '; backdoor' : '')
        ).replaceAll(' !!! ', '');
        cmds.push(cmd)

        if (flags.alias) {
          ns.tprintRaw(wrapCmdNode(ns, cmd, cmd));
        }

        if (flags.files) {
          const files = ns.ls(neighbor);
          for (const file of files) {
            try {
              ns.tprintRaw(wrapCmdNode(ns, file, `cat ${file}`, { marginLeft: '15px' }))
            } catch (e) {
              ns.alert(e);
            }
          }
        }
      }
    }
  }

  if (flags.process) {
    ns.disableLog('ALL');
    ns.tail();
    let lastCmd = null;
    for (const cmd of cmds) {
      ns.print('Running cmd: ' + cmd)
      let res = await terminal(ns, 'home; ' + cmd);
      while(!res) {
        ns.print('Waiting 2 seconds for cmd to finish')
        ns.print('Last cmd: ' + lastCmd)
        await ns.sleep(2000)
        res = await terminal(ns, 'home; ' + cmd);
      }
      lastCmd = cmd;
      await ns.sleep(100)
    }
  }
}
function str(backdoor, parent, neighbor) {
  if (!backdoor) return parent + ' -> '+ neighbor;

  return neighbor
}
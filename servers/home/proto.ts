
import { flags, getServers, setupDefault, setupTail, weight } from '@lib/utils';
import { config } from "./config";
import { BY_WEIGHT } from "./server/sort";
import { CAN_HACK, CAN_HAVE_MONEY, IS_NOT_PRIVATE, IS_PRIVATE } from "./server/filter";

export async function main(ns: NS) {
  const args = setupDefault(ns);

  const targets = getServers(ns)
    .filter(IS_NOT_PRIVATE(ns))
    .filter(CAN_HACK(ns))
    .filter(CAN_HAVE_MONEY(ns))
    .sort(BY_WEIGHT(ns))
    .slice(0, config.proto.attackTop);

  ns.tprint(JSON.stringify(targets, null, 2));

  ns.ui.setTailTitle(ns.sprintf('Targetting %s', targets.join(', ')));

  for (const target of targets) {
    ns.tprint(`Targetting ${target}`);
    ns.run('cnc/proto-batch.js', 1, target, ...ns.args);
  }
}

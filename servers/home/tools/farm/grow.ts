import { setupDefault } from "../../cnc/lib";

export async function main(ns: NS) {

  const args = setupDefault(ns, [
    ['target', ''],
  ]);

  const target = args['target'] as string;

  while(ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
    await ns.grow(target);
  }

}

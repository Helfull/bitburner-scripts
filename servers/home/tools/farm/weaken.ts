import { setupDefault } from "../../cnc/lib";

export async function main(ns: NS) {

  const args = setupDefault(ns, [
    ['target', ''],
  ]);

  const target = args['target'] as string;

  while(ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
    await ns.weaken(target);
  }
}

import { setupDefault } from "../cnc/lib";

export function checkVirus(ns: NS, virus: string) {
  if (!ns.fileExists(virus, 'home')) {
    return false;
  }
  return true;
}

export function tryPurchaseVirus(ns: NS, virus: string): boolean {

  if (checkVirus(ns, virus)) return true;

  try {
    ns.singularity.purchaseProgram(virus);
    return true;
  } catch (e) {
    return false;
  }
}

export async function main(ns: NS) {
  const args = setupDefault(ns, [
    ['viruses', [] as string[]],
  ]);

  for (const virus of args.viruses) {
    tryPurchaseVirus(ns, virus);
  }
}

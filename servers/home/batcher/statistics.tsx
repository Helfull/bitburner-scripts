import { createMountingPoint } from '@lib/MountingPoint';
import { Statistics } from '@/servers/home/batcher/ui/statistics';

export type Statistics = {
  batch: number,
  lastWeakenResult: {
    delay: number,
    endtime: number,
    now: number,
  },
  times?: {
    start: number,
    endHack: number,
    endWkn1: number,
    endGrow: number,
    endWkn2: number,
  }
  serverStats: {
    target: string,
    currentMoney: number,
    maxMoney: number,
    currentSecurity: number,
    minSecurity: number,
    hackChance?: number,
  },
  batchStats?: {
    greed: number,
    hackPercentThread: number,
    hPercent: number,
    hackThreads: number,
    wkn1Threads: number,
    growThreads: number,
    wkn2Threads: number,
    wknTime: number,
    growTime: number,
    hackTime: number,
  }
}

export async function main(ns: NS) {

  const port = ns.args[0] as number;

  ns.ui.closeTail();
  await ns.sleep(0);
  const mp = createMountingPoint(ns, {
    closeOnExit: false,
  });

  ns.atExit(() => mp.cleanup());

  return mp.mount(<Statistics port={port} />);
}
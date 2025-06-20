import React from 'react';
import { createMountingPoint } from '@lib/MountingPoint';
import { Stats } from '@/servers/home/tools/ui/Stats';

export async function main(ns: NS) {
  ns.ui.closeTail();
  await ns.sleep(0);
  const mp = createMountingPoint(ns, {
    closeOnExit: false,
  });

  ns.atExit(() => mp.cleanup());

  return mp.mount(<Stats />);
}

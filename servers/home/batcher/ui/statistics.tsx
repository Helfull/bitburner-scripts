import React, { useContext, useEffect, useState } from 'react';
import { NetscriptContext } from '@lib/MountingPoint';
import { usePort } from '@lib/hooks/usePort';
import 'chart.js/auto';
import type { Statistics } from '@/servers/home/batcher/statistics';
import { win } from '@lib/bbElements';
import { BatchThreads } from '@/servers/home/batcher/ui/charts/BatchThreads';
import { BatchTimes } from '@/servers/home/batcher/ui/charts/BatchTimes';
import { Delays } from '@/servers/home/batcher/ui/charts/Delays';
import { Money } from '@/servers/home/batcher/ui/charts/Money';
import { Security } from '@/servers/home/batcher/ui/charts/Security';
import { HackPercent } from '@/servers/home/batcher/ui/charts/HackPercent';
import { Times } from '@/servers/home/batcher/ui/charts/Times';
import { HackChance } from '@/servers/home/batcher/ui/charts/HackChance';

export function Statistics({ port }: { port: number }) {
  const ns: NS = useContext(NetscriptContext);

  useEffect(() => {
    ns.ui.resizeTail(1300, 800);
    ns.ui.moveTail(win.innerWidth / 2 - 1300 / 2, win.innerHeight / 2 - 800/2, ns.pid);
    ns.ui.setTailTitle('System Status');
  }, []);

  const [statistics, setStatistics] = useState<Statistics[]>([]);

  usePort(ns, port, (data: string) => {
    setStatistics((prevStats) => {
      const newStats = [...prevStats, JSON.parse(data) as Statistics];
      if (newStats.length > 50) {
        return newStats.slice(newStats.length - 50);
      }

      return newStats;
    });
  });

  return <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 400px)',
    }}>
    <div>
      <Delays metrics={statistics} />
    </div>
    <div>
      <Money metrics={statistics} />
    </div>
    <div>
      <Security metrics={statistics} />
    </div>
    <div>
      <BatchTimes metrics={statistics} />
    </div>
    <div>
      <BatchThreads metrics={statistics} />
    </div>
    <div>
      <HackPercent metrics={statistics} />
    </div>
    <div>
      <HackChance metrics={statistics} />
    </div>
    <div>
      <Times metrics={statistics} />
    </div>
    </div>;
}

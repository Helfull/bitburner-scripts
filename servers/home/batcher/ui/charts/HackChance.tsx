import type { Statistics } from '@/servers/home/batcher/statistics';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export function HackChance({ metrics }: { metrics: Statistics[] }) {
  const hackChanceData = {
    labels: metrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Hack Chance',
        data: metrics.map((stat) => stat?.serverStats?.hackChance as number),
      },
    ],
  };

  return <>
      <span>Hack Chance</span>
      <Line data={hackChanceData} />
  </>
}
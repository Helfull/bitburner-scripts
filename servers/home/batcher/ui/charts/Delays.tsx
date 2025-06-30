import type { Statistics } from '@/servers/home/batcher/statistics';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export function Delays({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.lastWeakenResult?.delay !== undefined && stat?.lastWeakenResult?.delay !== null);

  const delayData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [{
      label: 'Delays (ms)',
      data: validMetrics.map((stat) => stat?.lastWeakenResult?.delay as number),
    }],
  };

  return <>
      <span>Delays</span>
      <Bar data={delayData} />
  </>
}
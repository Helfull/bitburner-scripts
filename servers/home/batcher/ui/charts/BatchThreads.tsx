import type { Statistics } from '@/servers/home/batcher/statistics';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export function BatchThreads({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.batchStats?.hackThreads !== undefined &&
    stat?.batchStats?.wkn1Threads !== undefined &&
    stat?.batchStats?.growThreads !== undefined &&
    stat?.batchStats?.wkn2Threads !== undefined);


  const threadsData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Hack',
        data: validMetrics.map((stat) => stat?.batchStats?.hackThreads as number),
      },
      {
        label: 'Weaken',
        data: validMetrics.map((stat) => stat?.batchStats?.wkn1Threads as number),
      },
      {
        label: 'Grow',
        data: validMetrics.map((stat) => stat?.batchStats?.growThreads as number),
      },
      {
        label: 'Weaken 2',
        data: validMetrics.map((stat) => stat?.batchStats?.wkn2Threads as number),
      },
    ],
  };

  return <>
    <span>Batch Threads</span>
    <div class="chart-container">
      <Bar options={{
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      }} data={threadsData} />
    </div>
  </>;
}
import type { Statistics } from '@/servers/home/batcher/statistics';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export function BatchTimes({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.batchStats?.hackTime !== undefined &&
    stat?.batchStats?.wknTime !== undefined &&
    stat?.batchStats?.growTime !== undefined);

  const timesData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Hack',
        data: validMetrics.map((stat) => stat?.batchStats?.hackTime as number),
      },
      {
        label: 'Weaken',
        data: validMetrics.map((stat) => stat?.batchStats?.wknTime as number),
      },
      {
        label: 'Grow',
        data: validMetrics.map((stat) => stat?.batchStats?.growTime as number),
      }
    ],
  }

  return <>
      <span>Batch Times</span>
      <Line data={timesData} />
  </>
}
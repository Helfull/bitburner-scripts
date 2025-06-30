import type { Statistics } from '@/servers/home/batcher/statistics';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

export function HackPercent({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.batchStats?.hPercent !== undefined &&
    stat?.batchStats?.greed !== undefined &&
    stat?.batchStats?.hackPercentThread !== undefined);

  const serverMoneyData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'hPercent',
        data: validMetrics.map((stat) => stat?.batchStats?.hPercent as number),
      },
      {
        label: 'greed',
        data: validMetrics.map((stat) => stat?.batchStats?.greed as number),
      },
      {
        label: 'hackPercentThread',
        data: validMetrics.map((stat) => stat?.batchStats?.hackPercentThread as number),
      },
    ],
  };

  return <>
      <span>Hack percent</span>
      <Bar data={serverMoneyData} />
  </>
}
import type { Statistics } from '@/servers/home/batcher/statistics';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export function Times({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.times?.start !== undefined && stat?.times?.endHack !== undefined &&
    stat?.times?.endWkn1 !== undefined && stat?.times?.endGrow !== undefined && stat?.times?.endWkn2 !== undefined);

  const delayData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Hack',
        data: validMetrics.map((stat) => [(stat?.times?.start - Date.now()) as number, (stat?.times?.endHack - Date.now()) as number]),
        backgroundColor: 'rgb(54, 162, 235)',
      },
      {
        label: 'Weaken',
        data: validMetrics.map((stat) => [(stat?.times?.start - Date.now()) as number, (stat?.times?.endWkn1 - Date.now()) as number]),
        backgroundColor: 'rgb(255, 159, 64)',
      },
      {
        label: 'Grow',
        data: validMetrics.map((stat) => [(stat?.times?.start - Date.now()) as number, (stat?.times?.endGrow - Date.now()) as number]),
        backgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Weaken 2',
        data: validMetrics.map((stat) => [(stat?.times?.start - Date.now()) as number, (stat?.times?.endWkn2 - Date.now()) as number]),
        backgroundColor: 'rgb(255, 159, 64)',
      },
    ],
  };

  return <>
    <span>Times</span>
    <Bar options={{
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'right',
        },
      },
    }} data={delayData} />
  </>;
}
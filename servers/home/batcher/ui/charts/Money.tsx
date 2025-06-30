import type { Statistics } from '@/servers/home/batcher/statistics';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export function Money({ metrics }: { metrics: Statistics[] }) {
  const serverMoneyData = {
    labels: metrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Current Money',
        data: metrics.map((stat) => stat?.serverStats?.currentMoney as number),
      },
      {
        label: 'Max Money',
        data: metrics.map((stat) => stat?.serverStats?.maxMoney as number),
      },
    ],
  };

  return <>
      <span>Money</span>
      <Line data={serverMoneyData} />
  </>
}
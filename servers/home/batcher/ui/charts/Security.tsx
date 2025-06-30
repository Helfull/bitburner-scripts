import type { Statistics } from '@/servers/home/batcher/statistics';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export function Security({ metrics }: { metrics: Statistics[] }) {

  const validMetrics = metrics.filter((stat) => stat?.serverStats?.currentSecurity !== undefined &&
    stat?.serverStats?.minSecurity !== undefined);

  const serverSecurityData = {
    labels: validMetrics.map((stat) => stat.batch),
    datasets: [
      {
        label: 'Current Security',
        data: validMetrics.map((stat) => stat?.serverStats?.currentSecurity as number),
      },
      {
        label: 'Min Security',
        data: validMetrics.map((stat) => stat?.serverStats?.minSecurity as number),
      },
    ],
  };

  return <>
      <span>Security</span>
      <Line data={serverSecurityData} />
  </>
}
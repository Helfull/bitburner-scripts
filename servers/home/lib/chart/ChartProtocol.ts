import { MessageSchema, Protocol } from '@lib/networking/Protocol';

export type ChartProtocolData = MessageSchema & ({
  type: 'chart-data',
  data?: number[];
} | {
  type: 'chart-config',
  data?: {
    title?: string,
    xLabel?: string,
    yLabel?: string,
    xMin?: number,
    xMax?: number,
    yMin?: number,
    yMax?: number,
    displayLabels?: boolean,
    showXLabelsEveryOther?: boolean,
  }
} | {
  type: 'chart-command',
  data?: string
})

export class ChartProtocol extends Protocol<ChartProtocolData> {

  constructor(ns: NS, port: number, options: { debug?: boolean } = { debug: false }) {
    super(ns, port, options);
    this.registerMessageType({
      type: 'chart-data',
      parse: (data) => data,
      evaluate: (data: ChartProtocolData['data']) => Array.isArray(data) && data.length === 2 && typeof data[0] === 'number' && typeof data[1] === 'number'
    });
    this.registerMessageType({
      type: 'chart-config',
      parse: (data) => data,
    });
    this.registerMessageType({
      type: 'chart-command',
      parse: (data) => data,
    });
  }

}
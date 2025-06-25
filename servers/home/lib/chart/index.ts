import { MessageSchema, Protocol } from '@lib/chart/Protocol';
import { ChartProtocol, ChartProtocolData } from '@lib/chart/ChartProtocol';

const config = {
    vertical: '┃',
    horizontal: '━',
    corner: {
      bottomLeft: '┗',
      bottomRight: '┛',
      topLeft: '┏',
      topRight: '┓'
    }
};


export class Chart {

  constructor(protected ns: NS, protected options: {
    displayLabels?: boolean,
  } = {
    displayLabels: true,
  }) {}

  display(points: number[][]): void {

    if (!Array.isArray(points) || points.length === 0) {
      this.ns.printf('No points to display.');
      return;
    }

    let output = '';

    const xValuesRange = points.map(point => point[0]);
    const yValuesRange = points.map(point => point[1]);

    const xMax = Math.ceil(Math.max(...xValuesRange));
    const xMin = Math.floor(Math.min(...xValuesRange));

    const yMax = Math.ceil(Math.max(...yValuesRange));
    const yMin = Math.floor(Math.min(...yValuesRange));

    const xLabelWidth = String(xMax).length;
    const yLabelWidth = String(yMax).length + 1;

    const showXLabels = xLabelWidth < 4;
    const showYLabels = yLabelWidth < 4;

    const showXLabelsEveryOther = xLabelWidth > 1;
    const showYLabelsEveryOther = yLabelWidth > 1;

    let yPadding = yLabelWidth + 1;

    if (!this.options.displayLabels) {
      yPadding = 0;
    }

    for (let y = yMax; y >= yMin; y--) {

      if (this.options.displayLabels && showYLabels) {
        let yValue = this.ns.sprintf('%d', y + yMin);
        if (showYLabelsEveryOther && y % 2 !== 0) {
          yValue = ' '.repeat(yLabelWidth);
        }

        output += this.ns.sprintf(`%${yLabelWidth}s`, yValue) + config.vertical;
      } else {
        output += config.vertical;
      }

      for (let x = xMin; x < xMax; x++) {
        const pointExists = points.findIndex((point: number[]) => Math.floor(point[0]) === x && Math.floor(point[1]) === y);
        if (pointExists !== -1) {
          output += this.ns.sprintf(`%${xLabelWidth}s`, '●');
        } else {
          output += this.ns.sprintf(`%${xLabelWidth}s`, ' ');
        }
      }
      output += '\n';
    }

    output += this.ns.sprintf(`%${yPadding}s`, config.corner.bottomLeft);

    let labels = '';
    if (this.options.displayLabels && showXLabels) {
      for (let x = xMin; x <= xMax; x++) {
        if (showXLabelsEveryOther && x % 2 !== 0) {
          labels += ' '.repeat(xLabelWidth);
          continue;
        }
        labels += this.ns.sprintf(`%${xLabelWidth}d`, x);
      }
    }
    output += config.horizontal.repeat(labels.length) + '\n';
    output += ' '.repeat(yPadding);
    output += labels + '\n';
    this.ns.printf(output);

  }

}

export async function main(ns: NS) {
  const protocol = new ChartProtocol(ns, 9999);

  ns.disableLog('ALL');
  ns.clearLog();
  ns.ui.openTail();
  const points = [];
  while(true) {
    if (!await protocol.hasData()) {
      await ns.sleep(1);
    } else {
      ns.clearLog();

      const message: ChartProtocolData = await protocol.receive();

      try {
        switch(message?.type) {
          case 'chart-data':
            ns.print(`Point added: ${JSON.stringify(message.data)}`);
            points.push(message.data);

            if (points.length > 30) {
              points.shift(); // Keep only the last 100 points
            }

            const chart = new Chart(ns, { displayLabels: true });
            chart.display(points);
            break;

          case 'chart-config':
            // Handle chart configuration updates if needed
            ns.print(`Chart config received: ${message.data}`);
            break;

          case 'chart-command':
            // Handle chart commands if needed
            ns.print(`Chart command received: ${message.data}`);
            break;

          default:
            ns.print(`Unknown message type: ${JSON.stringify(message)}`);
        }

      } catch (error) {
        ns.printf('ERROR: %s', error);
      }
    }
    await ns.sleep(100);
  }
}
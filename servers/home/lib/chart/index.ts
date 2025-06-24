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

    let output = '';

    const xValuesRange = points.map(point => point[0]);
    const yValuesRange = points.map(point => point[1]);

    const xMax = Math.floor(Math.max(...xValuesRange));
    const xMin = Math.floor(Math.min(...xValuesRange));

    const yMax = Math.floor(Math.max(...yValuesRange));
    const yMin = Math.floor(Math.min(...yValuesRange));

    const xLabelWidth = String(xMax).length;
    const yLabelWidth = String(yMax).length + 1;

    const showXLabelsEveryOther = xLabelWidth > 1;
    const showYLabelsEveryOther = yLabelWidth > 1;

    let yPadding = yLabelWidth + 1;

    if (!this.options.displayLabels) {
      yPadding = 0;
    }

    for (let y = yMax; y >= yMin; y--) {

      if (this.options.displayLabels) {
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
    if (this.options.displayLabels) {
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
  const chart = new Chart(ns, {
    displayLabels: true
  });

  ns.disableLog('ALL');
  ns.clearLog();
  ns.ui.openTail();
  const points = [];
  let iteration = -1;

  while(true) {
    ns.clearLog();
    ns.print(`Iteration: ${iteration++}`);

    if (points.length > 30) {
      points.shift();
    }

    points.push([iteration,  Math.sin(iteration) * 2 + 1]);

    chart.display(points);

    await ns.sleep(500);
  }
}
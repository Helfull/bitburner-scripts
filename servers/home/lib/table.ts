import { stripColors } from '@/servers/home/cnc/lib';

const tableConfig = {
  // Should there be padding between divider and content
  padding: 1,

  // The characters used to draw the table
  divider: {
    vertical: '┃',
    horizontal: '─',
    cross: '╂',

    middle: {
      left: '┠',
      right: '┨',
      top: '┰',
      bottom: '┸',
    },

    corner: {
      topLeft: '┎',
      topRight: '┒',
      bottomLeft: '┖',
      bottomRight: '┚',
    },
  },
};

export function printTableObj(ns: NS, tableRows: { [key: string]: any }[], output = ns.tprint) {
  if (tableRows.length === 0) return;

  const table = {};

  for (const row of tableRows) {
    for (const key in row) {
      if (!table[key]) table[key] = [];
      table[key].push(row[key]);
    }
  }

  printTable(ns, table, output);
}

export function printTable(ns: NS, table: { [key: string]: any[] }, output = ns.tprint) {
  let strip = (v: string) => v;
  if (typeof stripColors === 'function') {
    strip = stripColors;
  }

  const header = Object.keys(table);
  const cols = Object.values(table).map((col) => col.map((v) => v?.toString() || ''));
  const rows = cols[0].map((_, i) => cols.map((col) => col[i]));

  const colWidths = header.map((columnHeader, i) => {
    const header = strip(columnHeader);
    const headerWidth = header.length;

    const rowsStr = rows.map((row) => strip(row[i] || ''));
    const colsWidth = rowsStr.map((row) => row.length);

    const result = Math.max(headerWidth, ...(colsWidth || []));
    return result;
  });

  const makeCell = (cellValue: string, i: number) => {
    return (
      ''.padStart(colWidths[i] - strip(cellValue || '').length + tableConfig.padding, ' ') +
      (cellValue || '') +
      ''.padEnd(tableConfig.padding, ' ')
    );
  };

  const padding = tableConfig.padding;

  const dividerVertical = tableConfig.divider.vertical;
  const dividerHorizontal = tableConfig.divider.horizontal;
  const dividerCross = tableConfig.divider.cross;

  const cornerTopLeft = tableConfig.divider.corner.topLeft;
  const cornerTopRight = tableConfig.divider.corner.topRight;
  const cornerBottomLeft = tableConfig.divider.corner.bottomLeft;
  const cornerBottomRight = tableConfig.divider.corner.bottomRight;

  const middleLeft = tableConfig.divider.middle.left;
  const middleRight = tableConfig.divider.middle.right;
  const middleTop = tableConfig.divider.middle.top;
  const middleBottom = tableConfig.divider.middle.bottom;

  output(
    [
      '',
      // Top border
      cornerTopLeft +
        header
          .map((_, i) => ''.padStart(colWidths[i] + padding * 2, dividerHorizontal).padEnd(padding, dividerHorizontal))
          .join(middleTop) +
        cornerTopRight,

      // Headers
      dividerVertical + header.map((v, i) => makeCell(v, i)).join(dividerVertical) + dividerVertical,

      // Middle border
      middleLeft +
        header
          .map((_, i) => ''.padStart(colWidths[i] + padding * 2, dividerHorizontal).padEnd(padding, dividerHorizontal))
          .join(dividerCross) +
        middleRight,

      // Rows
      rows
        .map((row) => dividerVertical + row.map((v, i) => makeCell(v, i)).join(dividerVertical) + dividerVertical)
        .join('\n'),

      // Bottom border
      cornerBottomLeft +
        header.map((_, i) => ''.padStart(colWidths[i] + padding * 2, dividerHorizontal)).join(middleBottom) +
        cornerBottomRight,
    ].join('\n'),
  );
}

function wrapPadding(str: string, start: string, end: string, paddingWidth: number) {
  return start.repeat(paddingWidth) + str + end.repeat(paddingWidth);
}

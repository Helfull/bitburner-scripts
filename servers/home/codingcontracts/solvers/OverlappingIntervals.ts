import type { Test } from '@/servers/home/codingcontracts/contracts';
import { assertSame, testSame, testsSame } from '@/servers/home/codingcontracts/solvers/utils';
import { Color } from '@lib/colors';

export const OverlappingsIntervals = (intervals: number[][]): number[][] => {
  const fixedIntervals: number[][] = [];
  let foundOverlaps = false;

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const [curIntervalStart, curIntervalEnd] = interval;

    let foundOverlap = false;

    for (let j = 0; j < fixedIntervals.length; j++) {
      /**
       * If the start or the end is between the
       * start and end of the interval, then we
       * need to merge the intervals
       *
       * [1, 3] [2, 4] => [1, 4]
       * [1, 3] [4, 5] => [1, 3] [4, 5]
       * [1, 3] [2, 5] => [1, 5]
       */

      const fixedInterval = fixedIntervals[j];
      const [fixedIntervalStart, fixedIntervalEnd] = fixedInterval;

      if (
        // Start is between the fixed interval
        (curIntervalStart >= fixedIntervalStart && curIntervalStart <= fixedIntervalEnd) ||
        // End is between the fixed interval
        (curIntervalEnd >= fixedIntervalStart && curIntervalEnd <= fixedIntervalEnd) ||
        // Fixed interval is between the current interval
        (fixedIntervalStart >= curIntervalStart && fixedIntervalStart <= curIntervalEnd) ||
        (fixedIntervalEnd >= curIntervalStart && fixedIntervalEnd <= curIntervalEnd)
      ) {
        fixedIntervals[j] = [
          Math.min(curIntervalStart, fixedIntervalStart),
          Math.max(curIntervalEnd, fixedIntervalEnd),
        ];
        foundOverlap = true;
        foundOverlaps = true;
        break;
      }
    }

    if (!foundOverlap) fixedIntervals.push(interval);
  }

  fixedIntervals.sort((a, b) => a[0] - b[0]);
  return !foundOverlaps ? fixedIntervals : OverlappingsIntervals(fixedIntervals);
};

export const tests: Record<string, Test> = {
  // prettier-ignore
  ...testsSame([
    [
      [[2,7],[10,17],[25,26],[19,27]],
      [[2,7],[10,17],[19,27]],
    ],
    [
      [[21,29],[6,10],[5,15]],
      [[5,15],[21,29]]
    ],
    [
      [[4,6],[23,30],[22,32]],
      [[4,6],[22,32]]
    ],
    [
      [[8,9],[19,25],[11,14],[7,9],[16,23],[11,17],[10,19],[2,9],[16,21],[25,31],[19,27],[7,15],[6,15],[19,24],[21,31],[19,28],[2,3]],
      [[2,31]]
    ],
    [
      [[10, 16], [1, 3], [8, 10], [2, 6]],
      [[1, 6], [8, 16]]
    ],
    [
      [[1,15],[2,5],[16,17],[18,24]],
      [[1,15],[16,17],[18,24]]
    ]
  ], OverlappingsIntervals),
};
export const OverlappingsIntervalsSolver = { run: OverlappingsIntervals, tests };

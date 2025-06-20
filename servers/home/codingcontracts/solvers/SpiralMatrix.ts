import type { SolverCallback, Test } from '@/servers/home/codingcontracts/contracts';
import { doc } from '@lib/bbElements';
import { Color } from '@lib/colors';
import { assertEquals, assertSame } from '@/servers/home/codingcontracts/solvers/utils';

export const SpiralMatrix: SolverCallback = (data: number[][]): number[] => {
  try {
    let height = data.length;
    let width = data[0].length;

    const result = [];

    let top = 0, bottom = height - 1;
    let left = 0, right = width - 1;

    while (top <= bottom && left <= right) {
      // Traverse from left to right
      for (let col = left; col <= right; col++) {
        result.push(data[top][col]);
      }
      top++;

      // Traverse downwards
      for (let row = top; row <= bottom; row++) {
        result.push(data[row][right]);
      }
      right--;

      if (top <= bottom) {
        // Traverse from right to left
        for (let col = right; col >= left; col--) {
          result.push(data[bottom][col]);
        }
        bottom--;
      }

      if (left <= right) {
        // Traverse upwards
        for (let row = bottom; row >= top; row--) {
          result.push(data[row][left]);
        }
        left++;
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const tests: Record<string, Test> = {
  "": () => {
    const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];
    const expected = [1, 2, 3, 6, 9, 8 ,7, 4, 5];

    assertSame(SpiralMatrix(input), expected);
  }
};
export const SpiralMatrixSolver = { run: SpiralMatrix, tests };

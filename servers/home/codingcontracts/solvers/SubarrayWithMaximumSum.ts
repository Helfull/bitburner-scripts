import type { Test } from '@/servers/home/codingcontracts/contracts';
import { Color } from '@lib/colors';

function findTheContiguousSubarrayWithMaximumSum(arr: number[]): number[] {
  let maxSum = 0;
  let currentSum = 0;
  let maxSumStart = 0;
  let maxSumEnd = 0;
  let s = 0;

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];

    if (maxSum < currentSum) {
      maxSum = currentSum;
      maxSumStart = s;
      maxSumEnd = i;
    }

    if (currentSum < 0) {
      currentSum = 0;
      s = i + 1;
    }
  }

  return arr.slice(maxSumStart, maxSumEnd + 1);
}

export const SubarrayWithMaximumSum = (input: number[]): number => {
  return findTheContiguousSubarrayWithMaximumSum(input).reduce((acc, val) => acc + val, 0);
};

export const tests: Record<string, Test> = {};
export const SubarrayWithMaximumSumSolver = { run: SubarrayWithMaximumSum, tests };

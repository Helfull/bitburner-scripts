import type { Test } from '@/servers/home/codingcontracts/contracts';
import { Color } from '@lib/colors';

function findSquareRoot(arr: string): string {
  let g = BigInt('10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
  let n = BigInt(arr);
  return calc(g, n).toString();
}

function calc(g: BigInt, n: BigInt): BigInt {
  // g = 50
  // n = 100
  // newG = (g + n / g) / 2
  // newG = (50 + 100 / 50) / 2
  // newG = (50 + 2) / 2
  // newG = 52 / 2
  // newG = 26

  const nG = BigInt(n / g);

  if (nG + BigInt(1) === g) {
    return nG;
  }

  if (nG - BigInt(1) === g) {
    return nG;
  }

  let newG = (g + nG) / BigInt(2);

  // Check if newG is equal to g
  if (newG === g) {
    return newG;
  }

  // If not, recursively call calc with newG and n
  return calc(newG, n);
}
export const FindSquareRoot = (input: string): string => {
  return findSquareRoot(input);
};

export const tests: Record<string, Test> = {
  'Square Root of 100': () => {
    const result = FindSquareRoot('100');
    if (result !== '10') throw new Error(`Expected 10, got ${result}`);
  },
  'Square Root of 9': () => {
    const result = FindSquareRoot('9');
    if (result !== '3') throw new Error(`Expected 3, got ${result}`);
  },
  'Square Root of 16': () => {
    const result = FindSquareRoot('16');
    if (result !== '4') throw new Error(`Expected 4, got ${result}`);
  }
};
export const FindSquareRootSolver = { run: FindSquareRoot, tests };

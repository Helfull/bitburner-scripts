import type { Test } from '@/servers/home/codingcontracts/contracts';
import { Color } from '@lib/colors';

function bigIntSqrt(n) {
  // Handle negative numbers or non-BigInt inputs
  if (typeof n !== 'bigint' || n < 0n) {
    return 0n; // Or throw an error
  }

  // Handle base cases
  if (n === 0n || n === 1n) {
    return n;
  }

  // Binary search to find the floor of the square root
  let low = 0n;
  let high = n; // The square root will never be greater than n itself (for n > 1)
  let answer = 0n;

  while (low <= high) {
    let mid = low + (high - low) / 2n;
    let square = mid * mid;

    if (square === n) {
      return mid; // Exact square root found
    } else if (square < n) {
      answer = mid; // mid could be a potential answer, try higher
      low = mid + 1n;
    } else {
      high = mid - 1n; // mid is too high, try lower
    }
  }

  // Now 'ans' holds floor(sqrt(n)).
  // We need to round to the nearest integer.
  // Check if ans + 1 is closer than ans.
  // This happens if (ans + 1)^2 - n is less than n - ans^2
  // Or simplified: 2 * ans + 1 < 2 * (n - ans^2)
  const floorSqrt = answer;
  const ceilingSqrt = answer + 1n;

  // Calculate the difference from the number for both floor and ceiling
  const diffFloor = n - (floorSqrt * floorSqrt);
  const diffCeiling = (ceilingSqrt * ceilingSqrt) - n;

  // If the ceiling square is exactly n, return ceilingSqrt
  if (ceilingSqrt * ceilingSqrt === n) {
    return ceilingSqrt;
  }

  // If the floor square is exactly n, return floorSqrt
  if (floorSqrt * floorSqrt === n) {
    return floorSqrt;
  }

  // Compare which is closer
  if (diffFloor < diffCeiling) {
    return floorSqrt;
  } else if (diffCeiling < diffFloor) {
    return ceilingSqrt;
  } else {
    // If equidistant, convention is to round up (e.g., Math.round behavior for .5)
    return ceilingSqrt;
  }
}

function findSquareRoot(targetStringValue: string): string {
  let result = bigIntSqrt(BigInt(targetStringValue));
  return result.toString();
}

export const FindSquareRoot = (input: string): string => {
  return findSquareRoot(input).toString();
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
  },
};
export const FindSquareRootSolver = { run: FindSquareRoot, tests };

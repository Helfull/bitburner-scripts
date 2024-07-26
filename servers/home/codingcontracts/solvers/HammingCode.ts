import type { Test } from '@/servers/home/codingcontracts/contracts';
import { Color } from '@lib/colors';

export const HammingCode = (binaryString: string): number => {
  const data = binaryString.trim().split('');

  const errorPosition = data
    // Get indexes of bits that are 1 to find the failed bit
    .map((bit, index) => (bit === '1' ? index : null))
    // Remove null values
    .filter(Boolean)
    // XOR all the indexes to find the failed bit the result is the failed bit index
    .reduce((acc, bitIndex) => {
      if (acc === null) return bitIndex;
      return acc ^ bitIndex;
    }, null);

  // Flip the failed bit
  if (errorPosition) {
    data[errorPosition] = data[errorPosition] === '1' ? '0' : '1';
  }

  // Remove parity bits at 0 and 2^N from the data
  let correctedBits = '';

  for (let i = 1; i < data.length; i++) {
    /**
     * Two potential ways to check if a number is a power of 2
     *
     * -> (i & (i - 1)) !== 0
     * See https://stackoverflow.com/a/600306 for more information and an explanation
     *
     * -> Math.log2(i).toString().includes('.')
     * This method is slower than the first one as we have to compute the log2 of the number
     * rather than just doing a bitwise operation
     */

    if ((i & (i - 1)) !== 0) {
      correctedBits += data[i];
    }
  }

  // Return the corrected bits as an decimal number
  return parseInt(correctedBits, 2);
};

export const tests: Record<string, Test> = {
  '11110000 - No Error, result: 8': () => {
    const input = '11110000';
    const expected = 8;

    const result = HammingCode(input);

    if (result !== expected) {
      throw new Error(
        Color.white.wrap(`Expected ${Color.green.wrap(`${expected}`)} but got ${Color.red.wrap(`${result}`)}`),
      );
    }
  },
  '1001101010 - Error (Expected: 1001101011), result 21': () => {
    const input = '1001101010';
    const expected = 21;

    const result = HammingCode(input);

    if (result !== expected) {
      throw new Error(
        Color.white.wrap(`Expected ${Color.green.wrap(`${expected}`)} but got ${Color.red.wrap(`${result}`)}`),
      );
    }
  },
};
export const HammingCodeSolver = { run: HammingCode, tests };

import type { SolverCallback, Test } from '@/servers/home/codingcontracts/contracts';
import { doc } from '@lib/bbElements';
import { Color } from '@lib/colors';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const CeaserCipher: SolverCallback = (data: [string, number]): string => {
  const [input, shift] = data;

  let result = '';

  for (const char of input) {
    if (char === ' ') {
      result += ' ';
      continue;
    }

    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid character: ${char}`);
    }

    const newIndex = index - shift;

    if (newIndex < 0) {
      result += alphabet[alphabet.length + newIndex];
      continue;
    }

    result += alphabet[newIndex];
  }

  return result;
};

export const tests: Record<string, Test> = {};
export const CeaserCipherSolver = { run: CeaserCipher, tests };

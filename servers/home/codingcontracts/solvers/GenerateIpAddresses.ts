import type { Test } from '@/servers/home/codingcontracts/contracts';
import { Color } from '@lib/colors';

export const GenerateIPAddresses = (input: string): string[] => {
  const result: string[] = [];
  const data = input.trim();
  if (data.length === 12) {
    return [data.match(/.{1,3}/g).join('.')];
  }

  for (let i = 1; i < Math.min(data.length, 4); i++) {
    for (let j = i + 1; j < Math.min(data.length, i + 4); j++) {
      for (let k = j + 1; k < Math.min(data.length, j + 4); k++) {
        const s1 = data.slice(0, i);
        const s2 = data.slice(i, j);
        const s3 = data.slice(j, k);
        const s4 = data.slice(k);

        if ([s1, s2, s3, s4].some((s) => parseInt(s) > 255 || (s.length > 1 && s[0] === '0'))) {
          continue;
        }

        result.push([s1, s2, s3, s4].join('.'));
      }
    }
  }

  return result;
};

export const tests: Record<string, Test> = {
  '25525511135 -> ["255.255.11.135", "255.255.111.35"]': () => {
    const input = '25525511135';
    const expected = ['255.255.11.135', '255.255.111.35'];

    const result = GenerateIPAddresses(input);

    if (!expected.every((ip) => result.includes(ip))) {
      throw new Error(
        Color.white.wrap(
          `Expected [${Color.green.wrap(expected.join(', '))}] but got [${Color.red.wrap(result.join(', '))}]`,
        ),
      );
    }
  },
  '1938718066 -> ["193.87.180.66"]': () => {
    const input = '1938718066';
    const expected = ['193.87.180.66'];

    const result = GenerateIPAddresses(input);

    if (!expected.every((ip) => result.includes(ip))) {
      throw new Error(
        Color.white.wrap(
          `Expected [${Color.green.wrap(expected.join(', '))}] but got [${Color.red.wrap(result.join(', '))}]`,
        ),
      );
    }
  },
};
export const GenerateIPAddressesSolver = { run: GenerateIPAddresses, tests };

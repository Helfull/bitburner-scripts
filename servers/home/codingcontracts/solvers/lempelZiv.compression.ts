import type { SolverCallback, Test } from '@/servers/home/codingcontracts/contracts';
import { doc } from '@lib/bbElements';
import { Color } from '@lib/colors';

export const LempleZivCompression = (data: string): string => {
  return result;
};

export const tests: Record<string, Test> = {
  'abracadabra     ->  7abracad47': () => {
    const input = 'abracadabra';
    const expected = '7abracad47';

    if (LempleZivCompression(input) !== '7abracad47') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'mississippi     ->  4miss433ppi': () => {
    const input = 'mississippi';
    const expected = '4miss433ppi';

    if (LempleZivCompression(input) !== '4miss433ppi') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'aAAaAAaAaAA     ->  3aAA53035': () => {
    const input = 'aAAaAAaAaAA';
    const expected = '3aAA53035';

    if (LempleZivCompression(input) !== '3aAA53035') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  '2718281828      ->  627182844': () => {
    const input = '2718281828';
    const expected = '627182844';

    if (LempleZivCompression(input) !== '627182844') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'abcdefghijk     ->  9abcdefghi02jk': () => {
    const input = 'abcdefghijk';
    const expected = '9abcdefghi02jk';

    if (LempleZivCompression(input) !== '9abcdefghi02jk') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'aaaaaaaaaaaa    ->  3aaa91': () => {
    const input = 'aaaaaaaaaaaa';
    const expected = '3aaa91';

    if (LempleZivCompression(input) !== '3aaa91') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'aaaaaaaaaaaaa   ->  1a91031': () => {
    const input = 'aaaaaaaaaaaaa';
    const expected = '1a91031';

    if (LempleZivCompression(input) !== '1a91031') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
  'aaaaaaaaaaaaaa  ->  1a91041': () => {
    const input = 'aaaaaaaaaaaaaa';
    const expected = '1a91041';

    if (LempleZivCompression(input) !== '1a91041') {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`,
        ),
      );
    }
  },
};
export const Solver = { run: LempleZivCompression, tests };

export function main(ns: NS) {
  ns.tprint('7abracad47' + ' ===??? ' + LempleZivCompression(ns, 'abracadabra'));
}

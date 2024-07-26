import { Color } from '@lib/colors';

export type Test = [any, any, boolean?];

export function testsSame(tests: Test[], action: (input: any) => any): { [key: string]: () => void } {
  return tests.reduce((acc, [input, expected, debug]) => {
    if (debug) {
      debugger;
    }
    const test = testSame(input, expected, action);

    acc[Object.keys(test)[0]] = test[Object.keys(test)[0]];

    return acc;
  }, {});
}

export function testSame(input: any, expected: any, action: (input: any) => any): { [key: string]: () => void } {
  return {
    [`${JSON.stringify(input)} => ${JSON.stringify(expected)}`]: () => assertSame(action(input), expected),
  };
}

export function assertSame<T>(actual: T, expected: T): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${Color.yellow.wrap(JSON.stringify(expected))}, but got ${Color.red.wrap(JSON.stringify(actual))}`,
    );
  }
}

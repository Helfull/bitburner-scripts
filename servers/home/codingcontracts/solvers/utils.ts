import { Color } from '@lib/colors';

export type Test = [any, any, boolean?];

export function testsSame(tests: Test[], action: (input: any) => any): { [key: string]: () => void } {
  return tests.reduce((acc, [input, expected, debug]) => {
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

export function assertTrue(value: boolean): void {
  if (value !== true) {
    throw new Error(
      `Expected true, but got ${Color.red.wrap(JSON.stringify(value))}`,
    );
  }
}

export function assertFalse(value: boolean): void {
  if (value !== false) {
    throw new Error(
      `Expected false, but got ${Color.red.wrap(JSON.stringify(value))}`,
    );
  }
}

export function assertEquals(a: any, b: any): void {
  if (a !== b) {
    throw new Error(
      `Expected ${Color.red.wrap(JSON.stringify(b))}, but got ${Color.red.wrap(JSON.stringify(a))}`,
    );
  }
}

export function assertNotEquals(a: any, b: any): void {
  if (a === b) {
    throw new Error(
      `Expected ${Color.red.wrap(JSON.stringify(b))}, but got ${Color.red.wrap(JSON.stringify(a))}`,
    );
  }
}
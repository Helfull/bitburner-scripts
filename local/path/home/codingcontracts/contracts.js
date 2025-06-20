// servers/home/lib/colors.ts
var Colors = class {
  fgColor = "";
  bgColor = "";
  styleStack = [];
  constructor() {
    addFgColor("black", "0");
    addFgColor("yellow", "3");
    addFgColor("pink", "5");
    addFgColor("grey", " 244");
    addFgColor("red", "9");
    addFgColor("green", "10");
    addFgColor("white", "15");
    addBgColor("red", "1");
    addBgColor("green", "2");
    addBgColor("yellow", "3");
    addBgColor("white", "15");
  }
  wrap(msg) {
    const elements = [this.fgColorCode, this.bgColorCode, ...this.styleStack].filter((x) => x.length > 0);
    const str = `\x1B[${elements.join(";")}m${msg}\x1B[0m`;
    this.fgColor = "";
    this.bgColor = "";
    this.styleStack = [];
    return str;
  }
  unwrap(msg) {
    return msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
  }
  get fgColorCode() {
    return this.fgColor ? `38;5;${this.fgColor}` : "";
  }
  get bgColorCode() {
    return this.bgColor ? `48;5;${this.bgColor}` : "";
  }
  static unwrap(msg) {
    return msg.replace(/\u001b[[(?);]{0,2}(;?\d)*./g, "");
  }
  fg(color) {
    this.fgColor = color.trim();
    return this;
  }
  bg(color) {
    this.bgColor = color.trim();
    return this;
  }
  get bold() {
    this.styleStack.push("1");
    return this;
  }
  get underline() {
    this.styleStack.push("4");
    return this;
  }
  get italic() {
    this.styleStack.push("3");
    return this;
  }
};
var availableFGColors = [];
var availableBGColors = [];
function addFgColor(name, color) {
  if (Object.hasOwn(Colors.prototype, name))
    return;
  availableFGColors.push(name);
  Object.defineProperty(Colors.prototype, name, {
    get() {
      return this.fg(color);
    }
  });
}
function addBgColor(name, color) {
  if (Object.hasOwn(Colors.prototype, name + "BG"))
    return;
  availableBGColors.push(name);
  Object.defineProperty(Colors.prototype, name + "BG", {
    get() {
      return this.bg(color);
    }
  });
}
var Color = new Colors();

// servers/home/codingcontracts/solvers/GenerateIpAddresses.ts
var GenerateIPAddresses = (input) => {
  const result = [];
  const data = input.trim();
  if (data.length === 12) {
    return [data.match(/.{1,3}/g).join(".")];
  }
  for (let i = 1; i < Math.min(data.length, 4); i++) {
    for (let j = i + 1; j < Math.min(data.length, i + 4); j++) {
      for (let k = j + 1; k < Math.min(data.length, j + 4); k++) {
        const s1 = data.slice(0, i);
        const s2 = data.slice(i, j);
        const s3 = data.slice(j, k);
        const s4 = data.slice(k);
        if ([s1, s2, s3, s4].some((s) => parseInt(s) > 255 || s.length > 1 && s[0] === "0")) {
          continue;
        }
        result.push([s1, s2, s3, s4].join("."));
      }
    }
  }
  return result;
};
var tests = {
  '25525511135 -> ["255.255.11.135", "255.255.111.35"]': () => {
    const input = "25525511135";
    const expected = ["255.255.11.135", "255.255.111.35"];
    const result = GenerateIPAddresses(input);
    if (!expected.every((ip) => result.includes(ip))) {
      throw new Error(
        Color.white.wrap(
          `Expected [${Color.green.wrap(expected.join(", "))}] but got [${Color.red.wrap(result.join(", "))}]`
        )
      );
    }
  },
  '1938718066 -> ["193.87.180.66"]': () => {
    const input = "1938718066";
    const expected = ["193.87.180.66"];
    const result = GenerateIPAddresses(input);
    if (!expected.every((ip) => result.includes(ip))) {
      throw new Error(
        Color.white.wrap(
          `Expected [${Color.green.wrap(expected.join(", "))}] but got [${Color.red.wrap(result.join(", "))}]`
        )
      );
    }
  }
};
var GenerateIPAddressesSolver = { run: GenerateIPAddresses, tests };

// servers/home/codingcontracts/solvers/HammingCode.ts
var HammingCode = (binaryString) => {
  const data = binaryString.trim().split("");
  const errorPosition = data.map((bit, index) => bit === "1" ? index : null).filter(Boolean).reduce((acc, bitIndex) => {
    if (acc === null)
      return bitIndex;
    return acc ^ bitIndex;
  }, null);
  if (errorPosition) {
    data[errorPosition] = data[errorPosition] === "1" ? "0" : "1";
  }
  let correctedBits = "";
  for (let i = 1; i < data.length; i++) {
    if ((i & i - 1) !== 0) {
      correctedBits += data[i];
    }
  }
  return parseInt(correctedBits, 2);
};
var tests2 = {
  "11110000 - No Error, result: 8": () => {
    const input = "11110000";
    const expected = 8;
    const result = HammingCode(input);
    if (result !== expected) {
      throw new Error(
        Color.white.wrap(`Expected ${Color.green.wrap(`${expected}`)} but got ${Color.red.wrap(`${result}`)}`)
      );
    }
  },
  "1001101010 - Error (Expected: 1001101011), result 21": () => {
    const input = "1001101010";
    const expected = 21;
    const result = HammingCode(input);
    if (result !== expected) {
      throw new Error(
        Color.white.wrap(`Expected ${Color.green.wrap(`${expected}`)} but got ${Color.red.wrap(`${result}`)}`)
      );
    }
  }
};
var HammingCodeSolver = { run: HammingCode, tests: tests2 };

// servers/home/codingcontracts/solvers/utils.ts
function testsSame(tests7, action) {
  return tests7.reduce((acc, [input, expected, debug]) => {
    if (debug) {
      debugger;
    }
    const test = testSame(input, expected, action);
    acc[Object.keys(test)[0]] = test[Object.keys(test)[0]];
    return acc;
  }, {});
}
function testSame(input, expected, action) {
  return {
    [`${JSON.stringify(input)} => ${JSON.stringify(expected)}`]: () => assertSame(action(input), expected)
  };
}
function assertSame(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${Color.yellow.wrap(JSON.stringify(expected))}, but got ${Color.red.wrap(JSON.stringify(actual))}`
    );
  }
}

// servers/home/codingcontracts/solvers/OverlappingIntervals.ts
var OverlappingsIntervals = (intervals) => {
  debugger;
  const fixedIntervals = [];
  let foundOverlaps = false;
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const [curIntervalStart, curIntervalEnd] = interval;
    let foundOverlap = false;
    for (let j = 0; j < fixedIntervals.length; j++) {
      const fixedInterval = fixedIntervals[j];
      const [fixedIntervalStart, fixedIntervalEnd] = fixedInterval;
      if (
        // Start is between the fixed interval
        curIntervalStart >= fixedIntervalStart && curIntervalStart <= fixedIntervalEnd || // End is between the fixed interval
        curIntervalEnd >= fixedIntervalStart && curIntervalEnd <= fixedIntervalEnd || // Fixed interval is between the current interval
        fixedIntervalStart >= curIntervalStart && fixedIntervalStart <= curIntervalEnd || fixedIntervalEnd >= curIntervalStart && fixedIntervalEnd <= curIntervalEnd
      ) {
        fixedIntervals[j] = [
          Math.min(curIntervalStart, fixedIntervalStart),
          Math.max(curIntervalEnd, fixedIntervalEnd)
        ];
        foundOverlap = true;
        foundOverlaps = true;
        break;
      }
    }
    if (!foundOverlap)
      fixedIntervals.push(interval);
  }
  fixedIntervals.sort((a, b) => a[0] - b[0]);
  return !foundOverlaps ? fixedIntervals : OverlappingsIntervals(fixedIntervals);
};
var tests3 = {
  // prettier-ignore
  ...testsSame([
    [
      [[2, 7], [10, 17], [25, 26], [19, 27]],
      [[2, 7], [10, 17], [19, 27]]
    ],
    [
      [[21, 29], [6, 10], [5, 15]],
      [[5, 15], [21, 29]]
    ],
    [
      [[4, 6], [23, 30], [22, 32]],
      [[4, 6], [22, 32]]
    ],
    [
      [[8, 9], [19, 25], [11, 14], [7, 9], [16, 23], [11, 17], [10, 19], [2, 9], [16, 21], [25, 31], [19, 27], [7, 15], [6, 15], [19, 24], [21, 31], [19, 28], [2, 3]],
      [[2, 31]]
    ],
    [
      [[10, 16], [1, 3], [8, 10], [2, 6]],
      [[1, 6], [8, 16]]
    ],
    [
      [[1, 15], [2, 5], [16, 17], [18, 24]],
      [[1, 15], [16, 17], [18, 24]]
    ]
  ], OverlappingsIntervals)
};
var OverlappingsIntervalsSolver = { run: OverlappingsIntervals, tests: tests3 };

// servers/home/codingcontracts/solvers/SubarrayWithMaximumSum.ts
function findTheContiguousSubarrayWithMaximumSum(arr) {
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
var SubarrayWithMaximumSum = (input) => {
  return findTheContiguousSubarrayWithMaximumSum(input).reduce((acc, val) => acc + val, 0);
};
var tests4 = {};
var SubarrayWithMaximumSumSolver = { run: SubarrayWithMaximumSum, tests: tests4 };

// servers/home/codingcontracts/solvers/encryption.CeaserCipher.ts
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var CeaserCipher = (data) => {
  const [input, shift] = data;
  let result = "";
  for (const char of input) {
    if (char === " ") {
      result += " ";
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
var tests5 = {};
var CeaserCipherSolver = { run: CeaserCipher, tests: tests5 };

// servers/home/codingcontracts/solvers/SquareRoot.ts
function findSquareRoot(arr) {
  let g = BigInt("10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
  let n = BigInt(arr);
  return calc(g, n).toString();
}
function calc(g, n) {
  const nG = BigInt(n / g);
  if (nG + BigInt(1) === g) {
    return nG;
  }
  if (nG - BigInt(1) === g) {
    return nG;
  }
  let newG = (g + nG) / BigInt(2);
  if (newG === g) {
    return newG;
  }
  return calc(newG, n);
}
var FindSquareRoot = (input) => {
  return findSquareRoot(input);
};
var tests6 = {
  "Square Root of 100": () => {
    const result = FindSquareRoot("100");
    if (result !== "10")
      throw new Error(`Expected 10, got ${result}`);
  },
  "Square Root of 9": () => {
    const result = FindSquareRoot("9");
    if (result !== "3")
      throw new Error(`Expected 3, got ${result}`);
  },
  "Square Root of 16": () => {
    const result = FindSquareRoot("16");
    if (result !== "4")
      throw new Error(`Expected 4, got ${result}`);
  }
};
var FindSquareRootSolver = { run: FindSquareRoot, tests: tests6 };

// servers/home/codingcontracts/contracts.ts
var ContractSolvers = {
  "Encryption I: Caesar Cipher": CeaserCipherSolver,
  "Generate IP Addresses": GenerateIPAddressesSolver,
  "Subarray with Maximum Sum": SubarrayWithMaximumSumSolver,
  "HammingCodes: Encoded Binary to Integer": HammingCodeSolver,
  "Merge Overlapping Intervals": OverlappingsIntervalsSolver,
  "Square Root": FindSquareRootSolver
};
export {
  ContractSolvers
};

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

// servers/home/codingcontracts/solvers/utils.ts
function testsSame(tests2, action) {
  return tests2.reduce((acc, [input, expected, debug]) => {
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
var tests = {
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
var OverlappingsIntervalsSolver = { run: OverlappingsIntervals, tests };
export {
  OverlappingsIntervals,
  OverlappingsIntervalsSolver,
  tests
};

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
var tests = {
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
var HammingCodeSolver = { run: HammingCode, tests };
export {
  HammingCode,
  HammingCodeSolver,
  tests
};

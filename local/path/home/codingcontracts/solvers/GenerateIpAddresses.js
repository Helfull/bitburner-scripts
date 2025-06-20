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
export {
  GenerateIPAddresses,
  GenerateIPAddressesSolver,
  tests
};

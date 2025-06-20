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

// servers/home/codingcontracts/solvers/lempelZiv.compression.ts
var LempleZivCompression = (data) => {
  return result;
};
var tests = {
  "abracadabra     ->  7abracad47": () => {
    const input = "abracadabra";
    const expected = "7abracad47";
    if (LempleZivCompression(input) !== "7abracad47") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "mississippi     ->  4miss433ppi": () => {
    const input = "mississippi";
    const expected = "4miss433ppi";
    if (LempleZivCompression(input) !== "4miss433ppi") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "aAAaAAaAaAA     ->  3aAA53035": () => {
    const input = "aAAaAAaAaAA";
    const expected = "3aAA53035";
    if (LempleZivCompression(input) !== "3aAA53035") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "2718281828      ->  627182844": () => {
    const input = "2718281828";
    const expected = "627182844";
    if (LempleZivCompression(input) !== "627182844") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "abcdefghijk     ->  9abcdefghi02jk": () => {
    const input = "abcdefghijk";
    const expected = "9abcdefghi02jk";
    if (LempleZivCompression(input) !== "9abcdefghi02jk") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "aaaaaaaaaaaa    ->  3aaa91": () => {
    const input = "aaaaaaaaaaaa";
    const expected = "3aaa91";
    if (LempleZivCompression(input) !== "3aaa91") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "aaaaaaaaaaaaa   ->  1a91031": () => {
    const input = "aaaaaaaaaaaaa";
    const expected = "1a91031";
    if (LempleZivCompression(input) !== "1a91031") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  },
  "aaaaaaaaaaaaaa  ->  1a91041": () => {
    const input = "aaaaaaaaaaaaaa";
    const expected = "1a91041";
    if (LempleZivCompression(input) !== "1a91041") {
      throw new Error(
        Color.white.wrap(
          `Expected ${Color.green.wrap(expected)} but got ${Color.red.wrap(LempleZivCompression(input))}`
        )
      );
    }
  }
};
var Solver = { run: LempleZivCompression, tests };
function main(ns) {
  ns.tprint("7abracad47 ===??? " + LempleZivCompression(ns, "abracadabra"));
}
export {
  LempleZivCompression,
  Solver,
  main,
  tests
};

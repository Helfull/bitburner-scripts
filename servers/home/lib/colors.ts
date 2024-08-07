class Colors {
  declare readonly white: Colors;
  declare readonly black: Colors;
  declare readonly red: Colors;
  declare readonly green: Colors;
  declare readonly yellow: Colors;
  declare readonly pink: Colors;
  declare readonly grey: Colors;
  declare readonly whiteBG: Colors;
  declare readonly redBG: Colors;
  declare readonly greenBG: Colors;
  declare readonly yellowBG: Colors;

  private fgColor: string = '';
  private bgColor: string = '';

  private styleStack: string[] = [];

  constructor() {
    addFgColor('black', '0');
    addFgColor('yellow', '3');
    addFgColor('pink', '5');
    addFgColor('grey', ' 244');
    addFgColor('red', '9');
    addFgColor('green', '10');
    addFgColor('white', '15');

    addBgColor('red', '1');
    addBgColor('green', '2');
    addBgColor('yellow', '3');
    addBgColor('white', '15');
  }

  public wrap(msg: string) {
    const elements = [this.fgColorCode, this.bgColorCode, ...this.styleStack].filter((x) => x.length > 0);

    const str = `\x1b[${elements.join(';')}m${msg}\x1b[0m`;
    this.fgColor = '';
    this.bgColor = '';
    this.styleStack = [];

    return str;
  }

  public unwrap(msg: string) {
    return msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }

  private get fgColorCode() {
    return this.fgColor ? `38;5;${this.fgColor}` : '';
  }

  private get bgColorCode() {
    return this.bgColor ? `48;5;${this.bgColor}` : '';
  }

  public static unwrap(msg: string) {
    return msg.replace(/\u001b[[(?);]{0,2}(;?\d)*./g, '');
  }

  public fg(color: string) {
    this.fgColor = color.trim();
    return this;
  }

  public bg(color: string) {
    this.bgColor = color.trim();
    return this;
  }

  get bold() {
    this.styleStack.push('1');
    return this;
  }

  get underline() {
    this.styleStack.push('4');
    return this;
  }

  get italic() {
    this.styleStack.push('3');
    return this;
  }
}

const availableFGColors = [];
const availableBGColors = [];

function addFgColor(name: string, color: string) {
  if (Object.hasOwn(Colors.prototype, name)) return;
  availableFGColors.push(name);
  Object.defineProperty(Colors.prototype, name, {
    get() {
      return this.fg(color);
    },
  });
}

function addBgColor(name: string, color: string) {
  if (Object.hasOwn(Colors.prototype, name + 'BG')) return;
  availableBGColors.push(name);
  Object.defineProperty(Colors.prototype, name + 'BG', {
    get() {
      return this.bg(color);
    },
  });
}

const Color = new Colors();
export { Color };
export async function main(ns: NS) {
  const output = [];
  output.push(Color.bold.wrap('Hello, World!'));
  output.push(Color.italic.wrap('Hello, World!'));
  output.push(Color.underline.wrap('Hello, World!'));

  output.push('\nForeground colors (text colors):\n');
  for (const color of availableFGColors) {
    output.push(Color[color].wrap('FG Color: ' + color));
  }

  output.push('\nBackground colors:\n');
  for (const color of availableBGColors) {
    output.push(Color[color + 'BG'].wrap('BG Color: ' + color));
  }

  output.push('\nCombination of colors and styles:\n');
  output.push(Color.red.whiteBG.wrap('White background with red text'));
  output.push(Color.red.whiteBG.underline.bold.wrap('White background with red text, underlined and bold'));
  output.push(Color.unwrap(Color.underline.bold.red.whiteBG.wrap('Colors removed after they have been applied')));

  ns.tprintf(output.join('\n'));
}

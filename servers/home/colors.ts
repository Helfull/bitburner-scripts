
const ESC = '\x1b['

class Colors {
  declare readonly white: Colors;
  declare readonly black: Colors;
  declare readonly red: Colors;
  declare readonly green: Colors;
  declare readonly whiteBG: Colors;
  declare readonly redBG: Colors;
  declare readonly greenBG: Colors;

  private fgColor: string = '';
  private bgColor: string = '';

  private styleStack: string[] = [];

  constructor() {
    addFgColor('black', '0');
    addFgColor('white', '15');
    addFgColor('red', '9');
    addFgColor('green', '10');

    addBgColor('white', '15');
    addBgColor('red', '9');
    addBgColor('green', '10');
  }

  public wrap(msg: string) {
    const str = `\x1b[${this.fgColorCode};${this.bgColorCode};${this.styleStack.join(';')}m${msg}\x1b[0m`;

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
    this.fgColor = color;
    return this;
  }

  public bg(color: string) {
    this.bgColor = color;
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

function addFgColor(name: string, color: string) {
  if (Object.hasOwn(Colors.prototype, name)) return;
  Object.defineProperty(Colors.prototype, name, {
    get() {
      return this.fg(color);
    }
  });
}

function addBgColor(name: string, color: string) {
  if (Object.hasOwn(Colors.prototype, name + 'BG')) return;
  Object.defineProperty(Colors.prototype, name + 'BG', {
    get() {
      return this.bg(color);
    }
  });
}

const Color = new Colors();
export { Color };
export async function main(ns: NS) {
  ns.tprint(Color.red.whiteBG.wrap('Hello, World!'));
  ns.tprint(Color.red.whiteBG.underline.bold.wrap('Hello, World!'));
  ns.tprint(Color.red.whiteBG.wrap('Hello, World!'));
  ns.tprint(Color.unwrap(Color.underline.bold.red.whiteBG.wrap('Hello, World!')));
}

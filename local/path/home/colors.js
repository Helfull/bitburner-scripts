// servers/home/colors.ts
var Color = class _Color {
  static wrap(color, msg) {
    return `${color}${msg}`;
  }
  static unwrap(msg) {
    return msg.replace(/\u001b[[(?);]{0,2}(;?\d)*./g, "");
  }
  static white(msg) {
    return _Color.wrap("\x1B[37m", msg);
  }
  static red(msg) {
    return _Color.wrap("\x1B[31m", msg);
  }
  static green(msg) {
    return _Color.wrap("\x1B[32m", msg);
  }
  static redBG(msg) {
    return _Color.wrap("\x1B[41m", msg);
  }
  static greenBG(msg) {
    return _Color.wrap("\x1B[42m", msg);
  }
};
function main(ns) {
}
export {
  Color,
  main
};

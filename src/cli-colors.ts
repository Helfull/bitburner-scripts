export const RESET = "\u001b[0m";

export const FGRAY = `\x1b[38;5;0m`;
export const FDARKRED = `\x1b[38;5;1m`;
export const FGREEN = `\x1b[38;5;2m`;
export const FYELLOW = `\x1b[38;5;3m`;
export const FBLUE = `\x1b[38;5;4m`;
export const FMAGENTA = `\x1b[38;5;5m`;
export const FTEAL = `\x1b[38;5;6m`;
export const FWHITE = `\x1b[38;5;7m`;
export const FBLACK = `\x1b[38;5;8m`;
export const FRED = `\x1b[38;5;9m`;

export const BGRAY = `\x1b[48;5;0m`;
export const BRED = `\x1b[48;5;1m`;
export const BGREEN = `\x1b[48;5;2m`;
export const BYELLOW = `\x1b[48;5;3m`;
export const BBLUE = `\x1b[48;5;4m`;
export const BMAGENTA = `\x1b[48;5;5m`;
export const BTEAL = `\x1b[48;5;6m`;
export const BWHITE = `\x1b[48;5;7m`;
export const BBLACK = `\x1b[48;5;8m`;
export const BDARKRED = `\x1b[48;5;9m`;

export function _(color: string, msg: string) {
  return `${color}${msg}${RESET}`
}

export function stripColors(msg: string) {
  return msg
    .replaceAll(RESET, '')
    .replaceAll(FGRAY, '')
    .replaceAll(FRED, '')
    .replaceAll(FGREEN, '')
    .replaceAll(FYELLOW, '')
    .replaceAll(FBLUE, '')
    .replaceAll(FMAGENTA, '')
    .replaceAll(FTEAL, '')
    .replaceAll(FWHITE, '')
    .replaceAll(FBLACK, '')
    .replaceAll(FDARKRED, '')
    .replaceAll(BGRAY, '')
    .replaceAll(BRED, '')
    .replaceAll(BGREEN, '')
    .replaceAll(BYELLOW, '')
    .replaceAll(BBLUE, '')
    .replaceAll(BMAGENTA, '')
    .replaceAll(BTEAL, '')
    .replaceAll(BWHITE, '')
    .replaceAll(BBLACK, '')
    .replaceAll(BDARKRED, '')
}
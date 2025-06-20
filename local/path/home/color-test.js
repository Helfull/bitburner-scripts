// servers/home/color-test.ts
async function main(ns) {
  ns.disableLog(`ALL`);
  ns.tprintf(`\x1B[1;35mUsing colors in script output with \x1B[1;36mtprint\x1B[1;35m & \x1B[36;1mtprintf\x1B[1;35m (terminal) and \x1B[36;1mprint\x1B[1;35m & \x1B[1;36mprintf\x1B[1;35m (log)`);
  ns.tprintf(`
`);
  ns.tprintf(`\x1B[1;36m\u2022 Using a 4-letter all-CAPS keyword at the start (4 colors)`);
  ns.tprintf(`       default color, you could use "OKAY" for alignment with other keywords.`);
  ns.tprintf(`INFO \u2500 only the first 4 characters matter, e.g. "INFORMATION" also works.`);
  ns.tprintf(`WARN \u2500 same story, e.g. "WARNING" can also be used.`);
  ns.tprintf(`FAIL \u2500 "ERROR" also works, making it the only 5-letter keyword.`);
  ns.tprintf(`
`);
  ns.tprintf(`\x1B[1;36m\u2022 Using an ANSI escape sequence`);
  ns.tprintf(`Syntax: \x1B[36m\\x1b[\x1B[35mn\x1B[36mm\x1B[m, replace \x1B[35mn\x1B[m by display attribute(s). Several attributes can be set in the same sequence, separated by semicolons.`);
  ns.tprintf(` 0     \u2500 \x1B[mall attributes off \u2500 equivalent to using an empty escape sequence: \x1B[36m\\x1b[m
`);
  ns.tprintf(` 1     \u2500 \x1B[1mbold text \u2500 bold characters are wider, so they don't line up with normal text.
`);
  ns.tprintf(` 4     \u2500 \x1B[4munderline \u2500 \x1B[4;31msame \x1B[4;33mcolor \x1B[4;35mas \x1B[4;36mthe \x1B[4;37mtext.
`);
  ns.tprintf(`
`);
  ns.tprintf(`\x1B[1;36m\u2022 Basic colors`);
  let palette4bit = ``;
  palette4bit += `30-37  \u2500 8 foreground colors:`;
  for (let i = 30; i <= 37; i++) {
    palette4bit += `\x1B[${i}m  ${i}  \x1B[m`;
  }
  palette4bit += `
`;
  palette4bit += `40-47  \u2500 8 background colors:`;
  for (let i = 40; i <= 47; i++) {
    if (i < 47) {
      palette4bit += `\x1B[${i};37m  ${i}  \x1B[m`;
    } else {
      palette4bit += `\x1B[${i};30m  ${i}  \x1B[m`;
    }
  }
  palette4bit += `
`;
  ns.tprintf(palette4bit);
  ns.tprintf(`
`);
  ns.tprintf(`\x1B[1;36m\u2022 256 color palette`);
  let palette8bit = ``;
  palette8bit += `38;5;\x1B[35mn\x1B[m \u2500 Set foreground color to palette index \x1B[35mn\x1B[m
`;
  palette8bit += `48;5;\x1B[35mn\x1B[m \u2500 Set background color to palette index \x1B[35mn\x1B[m
`;
  palette8bit += `
`;
  for (let i = 0; i < 16; i++) {
    if (i <= 6 || i === 8 || i === 12) {
      palette8bit += `\x1B[37;48;5;${i}m${String(i).padStart(9)}\x1B[m`;
    } else {
      palette8bit += `\x1B[30;48;5;${i}m${String(i).padStart(9)}\x1B[m`;
    }
  }
  palette8bit += `

`;
  for (let i = 0; i < 6; i++) {
    for (let j = 16; j <= 51; j++) {
      let n = i * 36 + j;
      if (j < 34) {
        palette8bit += `\x1B[37;48;5;${n}m${String(n).padStart(4)}\x1B[m`;
      } else {
        palette8bit += `\x1B[30;48;5;${n}m${String(n).padStart(4)}\x1B[m`;
      }
    }
    palette8bit += `
`;
  }
  palette8bit += `
`;
  for (let i = 232; i <= 255; i++) {
    if (i < 244) {
      palette8bit += `\x1B[37;48;5;${i}m${String(i).padStart(6)}\x1B[m`;
    } else {
      palette8bit += `\x1B[30;48;5;${i}m${String(i).padStart(6)}\x1B[m`;
    }
  }
  ns.tprintf(palette8bit);
}
export {
  main
};

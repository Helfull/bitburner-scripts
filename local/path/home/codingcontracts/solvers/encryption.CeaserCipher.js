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
var tests = {};
var CeaserCipherSolver = { run: CeaserCipher, tests };
export {
  CeaserCipher,
  CeaserCipherSolver,
  tests
};

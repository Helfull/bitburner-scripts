// servers/home/codingcontracts/solvers/SquareRoot.ts
function findSquareRoot(arr) {
  let g = BigInt("10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
  let n = BigInt(arr);
  return calc(g, n).toString();
}
function calc(g, n) {
  const nG = BigInt(n / g);
  if (nG + BigInt(1) === g) {
    return nG;
  }
  if (nG - BigInt(1) === g) {
    return nG;
  }
  let newG = (g + nG) / BigInt(2);
  if (newG === g) {
    return newG;
  }
  return calc(newG, n);
}
var FindSquareRoot = (input) => {
  return findSquareRoot(input);
};
var tests = {
  "Square Root of 100": () => {
    const result = FindSquareRoot("100");
    if (result !== "10")
      throw new Error(`Expected 10, got ${result}`);
  },
  "Square Root of 9": () => {
    const result = FindSquareRoot("9");
    if (result !== "3")
      throw new Error(`Expected 3, got ${result}`);
  },
  "Square Root of 16": () => {
    const result = FindSquareRoot("16");
    if (result !== "4")
      throw new Error(`Expected 4, got ${result}`);
  }
};
var FindSquareRootSolver = { run: FindSquareRoot, tests };
export {
  FindSquareRoot,
  FindSquareRootSolver,
  tests
};

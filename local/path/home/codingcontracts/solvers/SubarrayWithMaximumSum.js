// servers/home/codingcontracts/solvers/SubarrayWithMaximumSum.ts
function findTheContiguousSubarrayWithMaximumSum(arr) {
  let maxSum = 0;
  let currentSum = 0;
  let maxSumStart = 0;
  let maxSumEnd = 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    if (maxSum < currentSum) {
      maxSum = currentSum;
      maxSumStart = s;
      maxSumEnd = i;
    }
    if (currentSum < 0) {
      currentSum = 0;
      s = i + 1;
    }
  }
  return arr.slice(maxSumStart, maxSumEnd + 1);
}
var SubarrayWithMaximumSum = (input) => {
  return findTheContiguousSubarrayWithMaximumSum(input).reduce((acc, val) => acc + val, 0);
};
var tests = {};
var SubarrayWithMaximumSumSolver = { run: SubarrayWithMaximumSum, tests };
export {
  SubarrayWithMaximumSum,
  SubarrayWithMaximumSumSolver,
  tests
};

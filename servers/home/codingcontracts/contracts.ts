import { GenerateIPAddressesSolver } from '@/servers/home/codingcontracts/solvers/GenerateIpAddresses';
import { HammingCodeSolver } from '@/servers/home/codingcontracts/solvers/HammingCode';
import { OverlappingsIntervalsSolver } from '@/servers/home/codingcontracts/solvers/OverlappingIntervals';
import { SubarrayWithMaximumSumSolver } from '@/servers/home/codingcontracts/solvers/SubarrayWithMaximumSum';
import { CeaserCipherSolver } from '@/servers/home/codingcontracts/solvers/encryption.CeaserCipher';
import { FindSquareRootSolver } from '@/servers/home/codingcontracts/solvers/SquareRoot';
import { SpiralMatrixSolver } from '@/servers/home/codingcontracts/solvers/SpiralMatrix';

export type ContractType =
  | 'Algorithmic Stock Trader I'
  | 'Algorithmic Stock Trader II'
  | 'Algorithmic Stock Trader III'
  | 'Algorithmic Stock Trader IV'
  | 'Array Jumping Game II'
  | 'Array Jumping Game'
  | 'Compression I: RLE Compression'
  | 'Compression II: LZ Decompression'
  | 'Compression III: LZ Compression'
  | 'Encryption I: Caesar Cipher'
  | 'Encryption II: Vigenère Cipher'
  | 'Generate IP Addresses'
  | 'HammingCodes: Encoded Binary to Integer'
  | 'HammingCodes: Integer to Encoded Binary'
  | 'Minimum Path Sum in a Triangle'
  | 'Proper 2-Coloring of a Graph'
  | 'Sanitize Parentheses in Expression'
  | 'Shortest Path in a Grid'
  | 'Spiralize Matrix'
  | 'Subarray with Maximum Sum'
  | 'Total Ways to Sum II'
  | 'Total Ways to Sum'
  | 'Unique Paths in a Grid I'
  | 'Unique Paths in a Grid II'
  | 'Merge Overlapping Intervals'
  | 'Square Root';

export type SolverCallback = (data: unknown) => any;
export type Test = () => void;

export type Solver = {
  run: (data: any) => any;
  tests: Record<string, Test>;
};

export const ContractSolvers: Partial<Record<ContractType, Solver>> = {
  'Encryption I: Caesar Cipher': CeaserCipherSolver,
  'Generate IP Addresses': GenerateIPAddressesSolver,
  'Subarray with Maximum Sum': SubarrayWithMaximumSumSolver,
  'HammingCodes: Encoded Binary to Integer': HammingCodeSolver,
  'Merge Overlapping Intervals': OverlappingsIntervalsSolver,
  'Square Root': FindSquareRootSolver,
  'Spiralize Matrix': SpiralMatrixSolver,
};

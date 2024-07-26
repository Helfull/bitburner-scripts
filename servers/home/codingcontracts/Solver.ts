import { CodingContract } from '@/NetscriptDefinitions';
import { ContractSolvers } from '@/servers/home/codingcontracts/contracts';

export interface ContractSolver extends CodingContract {}

export class ContractSolver {
  constructor(private ns: NS, private type: string, private solvers = ContractSolvers) {
    Object.assign(this, ns.codingcontract);
  }

  hasSolver() {
    return this.solvers[this.type] !== undefined;
  }

  solve(contract: any, host?: string) {
    const data = this.getData(contract, host);
    const solver = this.solvers[this.type];
    if (!solver) throw new Error(`No solver for ${this.type}`);
    return solver.run(data);
  }

  test(): boolean {
    const solver = this.solvers[this.type];
    if (!solver) throw new Error(`No solver for ${this.type}`);

    let failed = false;

    Object.keys(solver.tests).forEach((name) => {
      try {
        solver.tests[name]();
        this.ns.tprint(`Test ${name} passed`);
      } catch (e) {
        this.ns.tprint(`Test ${name} failed: ${e.message}`);
        failed = true;
      }
    });

    return !failed;
  }
}

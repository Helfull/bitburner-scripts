import { getServers, setupDefault } from  '@lib/utils';
import { ContractSolver } from '@/servers/home/codingcontracts/Solver';

export async function main(ns: NS) {
  const args = setupDefault<{
    solve: boolean;
    target: string;
    test: boolean;
    verbose: boolean;
    type: string;
  }>(ns, [
    ['solve', false],
    ['test', false],
    ['target', ''],
    ['verbose', false],
    ['type', ''],
  ]);
  const solveContracts = args.solve;
  const target = args.target;

  const type = args['_'][0] || '';

  ns.tprint('---');
  ns.codingcontract.getContractTypes().forEach((type) => {
    ns.tprint(`  ${type}`);
  });
  ns.tprint('---');

  let servers = getServers(ns);

  if (target) {
    servers = servers.filter((server) => server === target);
  }

  if (servers.length === 0) {
    ns.tprint('No servers found');
    return;
  }

  const types: Record<string, number> = {};

  for (const server of servers) {
    const files = ns.ls(server);

    for (const file of files) {
      if (file.endsWith('.cct')) {

        const cct = ns.codingcontract.getContractType(file, server);

        ns.tprint(`${server}: ${file}`);
        ns.tprint(`  Type: ${cct}`);

        if (solveContracts) {
          solveContract(ns, cct, file, server);
        }

        if (args.verbose) {
          ns.tprintRaw(ns.codingcontract.getDescription(file, server));
        }

        types[cct] = (types[cct] || 0) + 1;
      }
    }
  }

  let sortedTypes = Object.keys(types)
    .filter((t) => t === type || !type)
    .sort((a, b) => types[b] - types[a]);

  ns.tprint(`Types: \n${sortedTypes.map((type) => `  ${type}: ${types[type]}`).join('\n')}`);

  for (const type of sortedTypes) {
    const solver = new ContractSolver(ns, type);

    if (!solver.hasSolver()) {
      continue;
    }

    if (args.test) {
      if (!solver.test()) {
        return;
      }

      let results = 0;
      for (let i = 0; i < 1_000; i++) {
        ns.tprint(`Solving ${type} ${i}`);
        const data = ns.codingcontract.createDummyContract(type);
        const answer = solver.solve(data);
        const reward = ns.codingcontract.attempt(answer, data);
        if (reward) {
          results++;
        } else {
          ns.write('failed.txt', JSON.stringify({ data: ns.codingcontract.getData(data).toString(), answer }) + '\n', 'a');
        }
        await ns.sleep(1);
        ns.rm(data);
      }

      ns.tprint(`Results for ${type}: ${results}`);
      ns.tprint('percentage: ' + ns.formatPercent(results / 1_000));
      continue;
    }

    ns.tprint(`Solving ${type}`);

    try {
      const data = ns.codingcontract.createDummyContract(type);
      ns.tprint(solver.test());
      const answer = solver.solve(data);
      ns.tprint(answer);
      const reward = ns.codingcontract.attempt(answer, data);
      if (reward) {
        ns.tprint(`Contract solved successfully! Reward: ${reward}`);
      } else {
        ns.tprint('Failed to solve contract.');
      }
    } catch (e) {
      ns.tprint(e.message);
    }

    ns.tprint('---');
  }
}

function solveContract(ns: NS, type, contractFile: string, host: string) {
  const solver = new ContractSolver(ns, type);

  if (!solver.hasSolver()) {
    ns.tprint(`No solver for ${type}`);
    return;
  }

  ns.tprint(`Solving ${type}`);
  ns.tprint(`  Data: ${JSON.stringify(contractFile)}`);
  ns.tprint('---');
  ns.tprint(solver.getDescription(contractFile, host).replaceAll('&nbsp;', ' '));
  ns.tprint('---');
  ns.tprintRaw(solver.getData(contractFile, host));
  ns.tprint('---');
  try {
    if (!solver.test()) {
      ns.tprint('Tests failed skipping contract');
      return;
    }
    const answer = solver.solve(contractFile, host);
    ns.tprint(answer);
    const reward = ns.codingcontract.attempt(answer, contractFile, host);
    if (reward) {
      ns.tprint(`Contract solved successfully! Reward: ${reward}`);
    } else {
      ns.tprint('Failed to solve contract.');
    }
  } catch (e) {
    ns.tprint(e.message);
  }

  ns.tprint('---');
}

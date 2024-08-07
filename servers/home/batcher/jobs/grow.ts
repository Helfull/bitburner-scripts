import { trySend } from '../../cnc/client';
import { config } from '../../config';
import { Job, JobBlocked } from '../JobRunner';
import { calcDelay } from './utils';

export type JobGrow = Job & {
  script: 'batcher/jobs/grow.js';
  args: {
    target: string;
    additionalMsec: number;
  };
};

export async function main(ns: NS) {
  const job: JobGrow & JobBlocked = JSON.parse(ns.args[0] as string);

  let delay = await calcDelay(ns, job);

  const growValue = await ns.grow(job.args.target, {
    additionalMsec: delay,
  });

  ns.writePort(job.args.controllerPort || config.cncPort, {
    type: 'grow',
    pid: ns.pid,
    target: job.args.target,
    result: ns.formatPercent(growValue) + ' ' + ns.getServerMoneyAvailable(job.args.target),
    job,
  });

  await trySend(
    ns,
    JSON.stringify({
      type: 'grow',
      pid: ns.pid,
      target: job.args.target,
      result: growValue,
      job,
    }),
    10,
  );

  ns.atExit(() => {
    ns.printf('INFO | Growing %s on %s finished', job.args.target, job.block.server);
  });
}

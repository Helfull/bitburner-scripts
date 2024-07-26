import { trySend } from '../../cnc/client';
import { config } from '../../config';
import { Job, JobBlocked } from '../JobRunner';
import { calcDelay } from './utils';

export type JobWeaken = Job & {
  script: 'batcher/jobs/weaken.js';
  args: {
    target: string;
    additionalMsec: number;
    controllerPort?: number;
    reportFinish?: boolean;
  };
};

export async function main(ns: NS) {
  const job: JobWeaken & JobBlocked = JSON.parse(ns.args[0] as string);

  let delay = await calcDelay(ns, job);

  const weakenValue = await ns.weaken(job.args.target, {
    additionalMsec: delay,
  });

  ns.writePort(job.args.controllerPort || config.cncPort, {
    type: 'weaken',
    pid: ns.pid,
    target: job.args.target,
    result: weakenValue,
    job,
  });

  await trySend(
    ns,
    JSON.stringify({
      type: 'weaken',
      pid: ns.pid,
      target: job.args.target,
      result: weakenValue,
      job,
    }),
    10,
  );

  if (job.args.reportFinish) {
    ns.writePort(job.args.controllerPort, { type: 'finish', job });
  }

  ns.atExit(() => {
    ns.printf('INFO | Weaking %s on %s finished', job.args.target, job.block.server);
  });
}

import { trySend } from '../../cnc/client';
import { config } from '../../config';
import { Job, JobBlocked } from '../JobRunner';
import { calcDelay } from './utils';

export type JobHack = Job & {
  script: 'batcher/jobs/hack.js';
  args: {
    target: string;
    additionalMsec: number;
  };
  timings?: {
    start: number;
    end: number;
  };
};

export async function main(ns: NS) {
  const job: JobHack & JobBlocked = JSON.parse(ns.args[0] as string);

  let delay = await calcDelay(ns, job);

  const hackValue = await ns.hack(job.args.target, {
    additionalMsec: delay,
  });

  ns.writePort(job.args.controllerPort || config.cncPort, {
    type: 'hack',
    pid: ns.pid,
    target: job.args.target,
    result: ns.formatNumber(hackValue),
    job,
  });

  await trySend(
    ns,
    JSON.stringify({
      type: 'hack',
      pid: ns.pid,
      target: job.args.target,
      result: hackValue,
      job,
    }),
    10,
  );

  ns.atExit(() => {
    ns.printf('INFO | Hacking %s on %s finished', job.args.target, job.block.server);
  });
}

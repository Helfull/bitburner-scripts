
import type { Job, JobBlocked } from "batcher/JobRunner";
import { trySend } from "../../cnc/client";

export type JobWeaken = Job & {
  script: 'batcher/jobs/weaken.js';
  args: {
    target: string;
    additionalMsec: number;
  }
};

export async function main(ns: NS) {
  const job: JobWeaken & JobBlocked = JSON.parse(ns.args[0] as string);

  const weakenValue = await ns.weaken(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });
  await trySend(ns, JSON.stringify({
    type: 'weaken',
    pid: ns.pid,
    target: job.args.target,
    result: weakenValue,
    job,
  }), 10);

  ns.atExit(() => {
    ns.printf('INFO | Weaking %s on %s finished', job.args.target, job.block.server);
  });
}

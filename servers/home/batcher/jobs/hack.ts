
import type { Job, JobBlocked } from "batcher/JobRunner";
import { trySend } from "../../cnc/client";

export type JobHack = Job & {
  script: 'batcher/jobs/hack.js';
  args: {
    target: string;
    additionalMsec: number;
  };
};

export async function main(ns: NS) {
  const job: JobHack & JobBlocked = JSON.parse(ns.args[0] as string);

  const hackValue = await ns.hack(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });

  await trySend(ns, JSON.stringify({
    type: 'hack',
    pid: ns.pid,
    target: job.args.target,
    result: hackValue,
    job,
  }), 10);

  ns.atExit(() => {
    ns.printf('INFO | Hacking %s on %s finished', job.args.target, job.block.server);
  });
}

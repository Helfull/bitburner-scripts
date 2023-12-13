import { NS } from "@ns";
import type { Job, JobBlocked } from "batcher/JobRunner";

export type JobGrow = Job & {
  script: 'batcher/jobs/grow.js';
  args: {
    target: string;
    additionalMsec: number;
  };
};

export async function main(ns: NS) {
  const job: JobGrow & JobBlocked = JSON.parse(ns.args[0] as string);

  await ns.grow(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });

  ns.atExit(() => {
    ns.printf('INFO | Growing %s on %s finished', job.args.target, job.block.server);
  });
}
import { NS } from "@ns";
import type { Job, JobBlocked } from "batcher/JobRunner";

export type JobWeaken = Job & {
  script: 'batcher/jobs/weaken.js';
  args: {
    target: string;
    additionalMsec: number;
  }
};

export async function main(ns: NS) {
  const job: JobWeaken & JobBlocked = JSON.parse(ns.args[0] as string);

  await ns.weaken(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });

  ns.atExit(() => {
    ns.tprintf('INFO | Weaking %s on %s finished', job.args.target, job.block.server);
  });
}
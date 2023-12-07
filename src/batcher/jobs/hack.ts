import { NS } from "@ns";
import type { Job, JobBlocked } from "batcher/JobRunner";

export type JobHack = Job & {
  script: 'batcher/jobs/hack.js';
  args: {
    target: string;
    additionalMsec: number;
  };
};

export async function main(ns: NS) {
  const job: JobHack & JobBlocked = JSON.parse(ns.args[0] as string);

  await ns.hack(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });

  ns.atExit(() => {
    ns.tprintf('INFO | Hacking %s on %s finished', job.args.target, job.block.server);
  });
}
import { trySend } from "../../cnc/client";
import { Job, JobBlocked } from "../JobRunner";

export type JobHack = Job & {
  script: "batcher/jobs/hack.js";
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

  const startTime = performance.now();

  const hackValue = await ns.hack(job.args.target, {
    additionalMsec: job.args.additionalMsec,
  });

  await trySend(
    ns,
    JSON.stringify({
      type: "hack",
      pid: ns.pid,
      target: job.args.target,
      result: hackValue,
      job,
      timings: {
        start: startTime,
        end: performance.now(),
        expectedStart: performance.now() - job.args.additionalMsec,
        expectedEnd: performance.now() + job.args.additionalMsec,
      },
    }),
    10
  );

  ns.atExit(() => {
    ns.printf(
      "INFO | Hacking %s on %s finished",
      job.args.target,
      job.block.server
    );
  });
}

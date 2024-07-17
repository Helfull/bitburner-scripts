import { JobBlocked, JobRunner } from "./batcher/JobRunner";
import { RAMManager } from "./batcher/RamManager";
import { getServers, setupDefault } from "./cnc/lib";
import { BY_RAM_USAGE } from "./server/sort";
import { Logger } from "./tools/logger";

export async function main(ns) {
  const args = setupDefault(ns);
  ns.clearLog();
  const log = new Logger(ns);

  const rmm = new RAMManager(
    ns,
    getServers(ns).sort(BY_RAM_USAGE(ns)).map(ns.getServer)
  );

  const testJobs: JobBlocked[] = [
    {
      script: "batcher/jobs/hack.js",
      threads: 100000,
      args: {
        target: "foodnstuff",
        additionalMsec: 0,
      },
      block: {
        server: "foodnstuff",
        ramReq: 100000 * 1.75,
        threadSize: 1.75,
        threads: 100000,
      },
    },
    {
      script: "batcher/jobs/weaken.js",
      threads: 100000,
      args: {
        target: "foodnstuff",
        additionalMsec: 0,
      },
      block: {
        server: "foodnstuff",
        ramReq: 100000 * 1.75,
        threadSize: 1.75,
        threads: 100000,
      },
    },
    {
      script: "batcher/jobs/grow.js",
      threads: 100000,
      args: {
        target: "foodnstuff",
        additionalMsec: 0,
      },
      block: {
        server: "foodnstuff",
        ramReq: 100000 * 1.75,
        threadSize: 1.75,
        threads: 100000,
      },
    },
  ];

  const runner = new JobRunner(ns, rmm, log);

  for (const job of testJobs) {
    try {
      await runner.run(job);
    } catch (e) {
      log.error(e);
    }
  }
}

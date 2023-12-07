import { NS } from "../../NetscriptDefinitions";
import type { Block, RAMManager } from "batcher/RamManager";
import type { JobGrow } from "batcher/jobs/grow";
import type { JobWeaken } from "batcher/jobs/weaken";
import type { JobHack } from "batcher/jobs/hack";

export type Job  = {
  script: string;
  threads: number;
  args?: (string|number|boolean|object)[]|object;
}

export type JobBlocked = Job & {
  block: Block;
  args: (string|number|boolean|object)[]|object;
}

export type JobRunning = JobBlocked & {
  dataPort: number;
}

export type Jobs = JobWeaken | JobGrow | JobHack | Job;

export class JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    protected readonly dataPortId = ns.pid,
    protected readonly dataPort = ns.getPortHandle(dataPortId),
  ) {}

  /**
   * Run a job in batches
   * @param job The job to run
   */
  async batchJob(job: Jobs) {
    const scriptRam = this.ns.getScriptRam(job.script);
    const perIterationThreads = Math.floor(this.rmm.getSmallestBlock().ram / scriptRam);
    const iterationsReq = Math.ceil(job.threads / perIterationThreads);

    for (let i = 0; i < iterationsReq; i++) {
      await this.run({
        script: job.script,
        threads: perIterationThreads,
        args: job.args || {},
        block: {
          server: 'NULL SERVER',
          ramReq: perIterationThreads * scriptRam,
        }
      });
    }
  }

  /**
   * Run a job
   * @param job The job to run
   * @returns TRUE if successful, FALSE if not
   */
  async run(job: JobBlocked, wait = true) {
    if (job.threads <= 0) return true;
    const block = job.block;
    const jobAssign = this.rmm.assign(block);

    if (!jobAssign) return false;

    this.ns.printf('INFO | Assigning %s [%s] to %s with %s threads', job.script, job.args, block.server, job.threads);
    if (job.threads > 0) {
      this.ns.scp(job.script, block.server, 'home');
      const pid = this.ns.exec(job.script, block.server, job.threads, JSON.stringify(job));
      while (wait && this.ns.isRunning(pid)) {
        this.ns.printf('Waiting for %s to finish! [%s]', job.script, job.args);
        await this.ns.sleep(5000);
      }
    }

    return true;
  }

  async dispatch(job: JobBlocked) {
    return this.run(job, false);
  }
}
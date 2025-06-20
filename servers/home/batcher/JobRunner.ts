import { Logger } from '../tools/logger';
import { RAMManager } from './RamManager';
import type { AssignedBlock, Block, ServerBlock } from './RamManager';
import { JobGrow } from './jobs/grow';
import { JobHack } from './jobs/hack';
import { JobWeaken } from './jobs/weaken';

export class RunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = '_RunnerError';
  }

  static failToExec(script: string, args: string) {
    return new RunnerError(`Failed to execute ${script} with ${args}`);
  }

  static failToAssign(block: Block, blocks: ServerBlock[]) {
    const serverBlocks = blocks.map((b: ServerBlock) => ({
      server: b.server,
      ram: b.ram,
    }));

    return new RunnerError(
      `Failed to assign block ${JSON.stringify(block, null, 2)} from ${JSON.stringify(serverBlocks, null, 2)}`,
    );
  }
}

export class RAMMissingError extends RunnerError {
  constructor(message: string) {
    super(message);
    this.name = '_RAMMissingError';
  }
}

export type Job = {
  script: string;
  threads: number;
  args?: (string | number | boolean | object)[] | object;
  timings?: {
    now?: number;
    end: number;
    duration: number;
  };
};

export type JobBlocked = Job & {
  block: Block;
  args: (string | number | boolean | object)[] | object;
};

export type JobRunning = JobBlocked & {
  dataPort?: number;
};

export type Jobs = JobWeaken | JobGrow | JobHack | Job;

export class JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    protected readonly log: Logger,
    protected readonly dataPortId = ns.pid,
    protected readonly dataPort = ns.getPortHandle(dataPortId),
  ) {}

  /**
   * Run a job in batches
   * @param job The job to run
   */
  async batchJob(job: Jobs) {
    const scriptRam = this.ns.getScriptRam(job.script);
    this.ns.printf('INFO | Script: %s', job.script);
    this.ns.printf('INFO | Script RAM: %s', scriptRam);

    const perIterationThreads = Math.min(job.threads, Math.floor(this.rmm.getBiggestBlock().ram / scriptRam));
    this.ns.printf('INFO | Threads: %s', job.threads);

    const iterationsReq = Math.ceil(job.threads / perIterationThreads);
    this.ns.printf('INFO | Per Iteration Threads: %s', perIterationThreads);

    await this.ns.asleep(100);
    for (let i = 0; i < iterationsReq; i++) {
      await this.run({
        script: job.script,
        threads: perIterationThreads,
        args: job.args || {},
        block: {
          server: 'NULL SERVER',
          ramReq: perIterationThreads * scriptRam,
          threads: perIterationThreads,
          threadSize: scriptRam,
        },
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
    this.log.info('Assigning block: %s', JSON.stringify(block));
    const jobAssignedBlocks: AssignedBlock | false = this.rmm.assign(block);

    if (jobAssignedBlocks === false) {
      throw RAMMissingError.failToAssign(block, this.rmm.all);
    }

    this.ns.printf(
      'INFO | Assigning %s [%s] to %s with %s threads',
      job.script,
      JSON.stringify(job.args),
      jobAssignedBlocks.ramBlocks.map((b) => b.server).join(', '),
      job.threads,
    );

    const pids = [];

    const jobRunning: JobRunning = {
      ...job,
      timings: {
        now: Date.now(),
        end: Date.now() + (job.timings?.end ?? 0),
        duration: job.timings?.duration ?? 0,
      },
    };

    this.log.info('Timings: %s', JSON.stringify(jobRunning.timings));

    for (const ramBlock of jobAssignedBlocks.ramBlocks) {
      this.log.info('Running %s on %s with %s threads', jobRunning.script, ramBlock.server, ramBlock.threads);

      this.ns.scp(job.script, ramBlock.server, 'home');

      const pid = this.ns.exec(
        jobRunning.script,
        ramBlock.server,
        { threads: ramBlock.threads, temporary: true },
        JSON.stringify(jobRunning),
        '--cli',
      );

      if (pid === 0) {
        this.log.error(
          '[%s][JOB_RUNNER_EXEC_SCRIPT_FAILED] Failed to exec %s with "%s" on %s (Threads: %s)',
          this.ns.pid,
          jobRunning.script,
          JSON.stringify(jobRunning.args),
          ramBlock.server,
          ramBlock.threads,
        );
        this.log.error('Job: %s', JSON.stringify(jobRunning));
        throw RunnerError.failToExec(jobRunning.script, JSON.stringify({ jobRunning }));
      }

      pids.push({ server: ramBlock.server, pid });
    }

    while (wait && pids.some(({ pid }) => this.ns.isRunning(pid))) {
      this.ns.printf(
        'Waiting for %s to finish on [%s]! [%s]',
        jobRunning.script,
        pids.filter(({ pid }) => this.ns.isRunning(pid)).map(({ server }) => server),
        JSON.stringify(jobRunning.args),
      );
      await this.ns.asleep(5000);
    }

    return true;
  }

  async dispatch(job: JobBlocked) {
    return this.run(job, false);
  }
}

import { config } from '../../config';
import { JobBlocked } from '../JobRunner';

export async function calcDelay(ns: NS, job: JobBlocked): Promise<number> {
  if (job.timings === undefined) return 0;

  const delay = job.timings.end - job.timings.duration - Date.now();

  if (delay < 0) {
    ns.writePort(job.args.controllerPort || config.cncPort, { type: 'late', delay: -delay, job });
    return 0;
  }

  ns.writePort(job.args.controllerPort || config.cncPort, { type: 'delay', delay, job });

  return delay;
}

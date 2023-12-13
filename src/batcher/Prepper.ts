import { NS } from "../../NetscriptDefinitions";
import { Metrics } from "batcher/Metrics";
import type { RAMManager } from "batcher/RamManager";
import { JobRunner } from "batcher/JobRunner";
import { getServers } from "cnc/lib";
import { getRunningScripts, needsPrepping, weightSort } from "lib/utils";

export class Prepper extends JobRunner {
  constructor(
    protected readonly ns: NS,
    protected readonly rmm: RAMManager,
    private readonly metrics = new Metrics(ns),
  ) {
    super(ns, rmm);
  }

  async loop() {
    while(true) {
      this.ns.printf('INFO | Checking for targets to prepare');

      const runningPreps = getRunningScripts(this.ns, 'home', 'prep.js').map(p => p.args[0]);
      const runningBatchers = getRunningScripts(this.ns, 'home', 't.js').map(p => p.args[0]);

      const targets = getServers(this.ns)
        .filter(s => this.ns.hasRootAccess(s))
        .filter(s => needsPrepping(this.ns, s))
        .filter(s => !runningPreps.includes(s))
        .filter(s => !runningBatchers.includes(s))
        .sort((a, b) => weightSort(this.ns, a, b));

      this.ns.printf('INFO | Targets to prepare: %s', targets.join(', '));

      for(const target of targets) {
        this.ns.exec('prep.js', 'home', 1, target);
      }

      this.ns.printf('INFO | Sleeping for %s', this.ns.tFormat(120000));
      await this.ns.sleep(120000);
    }
  }

  /**
   * Preps a target maxing out money and lowering security
   * @param target The target to prep
   */
  async execute(target: string) {
    this.ns.printf('INFO | Target: %s', target);

    const prepMetrics = this.metrics.calcPrep(target);
    this.ns.printf('INFO | Prep Metrics: %s', JSON.stringify(prepMetrics));
    await this.ns.asleep(100);

    const biggestRamBlock = this.rmm.getBiggestBlock().ram;
    this.ns.printf('INFO | RAM Blocks: %s', this.rmm.getCountBlocksOfSize(1.75));
    this.ns.printf('INFO | Biggest Blocks: %s', biggestRamBlock / 1.75);
    this.ns.printf('INFO | Smallest Blocks: %s', this.rmm.getSmallestBlock().ram / 1.75);
    this.ns.printf('INFO | Total Blocks required: %s', prepMetrics.wknThreads + prepMetrics.grwThreads + prepMetrics.grwWknThreads);

    await this.ns.asleep(100);
    await this.batchJob({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.wknThreads,
      args: {
        target,
        additionalMsec: 0,
      },
    });

    await this.batchJob({
      script: "batcher/jobs/grow.js",
      threads: prepMetrics.grwThreads,
      args: {
        target,
        additionalMsec: 0,
      },
    });

    await this.batchJob({
      script: "batcher/jobs/weaken.js",
      threads: prepMetrics.grwWknThreads,
      args: {
        target,
        additionalMsec: 0,
      }
    });
  }
}
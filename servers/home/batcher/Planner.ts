import { Server } from '@/servers/home/batcher/Server';
import { RAMManager } from '@/servers/home/batcher/RAMManager';

export const SEC_DEC_WKN = 0.05;
export const SEC_INC_HCK = 0.002;
export const SEC_INC_GRW = 0.004;

export class Planner {

  constructor(private ns: NS, private target: string) {}

  calcPerBatch() {
      const hacking = this.ns.formulas.hacking;

      const server = this.ns.getServer(this.target);
      const player = this.ns.getPlayer();

      server.hackDifficulty = server.minDifficulty;
      server.moneyAvailable = server.moneyMax;

      const greed = 0.1;

      const hackPercent = hacking.hackPercent(server, player);
      const hackThreads = Math.max(1, Math.ceil(greed / hackPercent));

      server.moneyAvailable = server.moneyMax * (1 - greed);
      const growThreads = hacking.growThreads(server, player, server.moneyMax);

      return {
        hackThreads,
        growThreads,
      }
  }

  async plan() {
    this.ns.print(`Planning batch for target: ${this.target}`);

    const ramManager = new RAMManager(this.ns);

    this.ns.print('Total ram: ' + this.ns.formatRam(ramManager.getCurrentAvailableRAM()));

    const { hackThreads, growThreads } = this.calcPerBatch();

    this.ns.print(`Calculated hack threads: ${hackThreads}`);
    this.ns.print(`Calculated grow threads: ${growThreads}`);


    this.ns.print(`Planning complete for target: ${this.target}`);
  }

}
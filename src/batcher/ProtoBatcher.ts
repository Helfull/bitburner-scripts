import { BatchRunner } from "batcher/BatchRunner";

export class ProtoBatcher extends BatchRunner {
  async loop(target: string, greed = 0.1, startDelay = 0) {
    while(true) {
      const finishTimes = await super.execute(target, greed, startDelay);

      const finishTime = Math.max(...Object.values(finishTimes));
      this.ns.printf('INFO | Sleeping for %s', this.ns.tFormat(finishTime));
      await this.ns.sleep(finishTime);
    }
  }
}
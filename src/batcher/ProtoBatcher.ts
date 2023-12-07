import { BatchRunner } from "batcher/BatchRunner";

export class ProtoBatcher extends BatchRunner {

  async loop(target: string, startDelay = 0) {
    while(true) {
      const finishTimes = await super.execute(target, startDelay);

      const finishTime = Math.max(...Object.values(finishTimes));
      this.ns.printf('INFO | Sleeping for %s', this.ns.tFormat(finishTime));
      await this.ns.sleep(finishTime);
    }
  }

}
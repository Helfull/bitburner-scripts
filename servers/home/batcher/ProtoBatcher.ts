import { BatchRunner } from "./BatchRunner";

export class ProtoBatcher extends BatchRunner {

  async loop(target: string, startDelay = 0) {
    let batchCount = 0;
    let batchesSinceLastError = 0;
    while(true) {
      try {
        const finishTimes = await super.execute(target, startDelay, batchCount);
        const finishTime = Math.max(...Object.values(finishTimes));
        this.log.info('Batch finishes in %s', this.ns.tFormat(finishTime));
        batchCount++;
        batchesSinceLastError++;
        this.ns.setTitle(this.getTitle(target, batchCount, batchesSinceLastError));
        await this.ns.sleep(20);
      } catch (e) {
        if (e.name === '_RunnerError') {
          this.ns.setTitle(this.ns.sprintf('%s, Error: %s', this.getTitle(target, batchCount, batchesSinceLastError), e.message));
          batchesSinceLastError = 0;
          await this.ns.sleep(100);
        } else {
          this.ns.tprint(e);
        }
      }
    }
  }

  protected getTitle(target: string, batchCount: number, batchesSinceLastError: number) {
    return this.ns.sprintf('Batch %s (%s): %s', batchCount, batchesSinceLastError, target);
  }

}

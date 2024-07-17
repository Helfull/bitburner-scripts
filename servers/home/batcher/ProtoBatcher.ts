import { BatchRunner } from "./BatchRunner";
import { RAMManager } from "./RamManager";

export class ProtoBatcher extends BatchRunner {
  async loop(target: string, startDelay = 0) {
    this.log.info("Target: %s", target);
    this.ns.setTitle(this.getTitle(target, 0, 0));
    let batchCount = 0;
    let batchesSinceLastError = 0;
    while (true) {
      try {
        this.log.info("Batch %s", batchCount);
        const finishTimes = await super.execute(target, startDelay, batchCount);
        const finishTime = Math.max(...Object.values(finishTimes));
        this.log.info("Batch finishes in %s", this.ns.tFormat(finishTime));
        batchCount++;
        batchesSinceLastError++;
        this.ns.setTitle(
          this.getTitle(target, batchCount, batchesSinceLastError)
        );

        await this.ns.sleep(Math.ceil(finishTime));
      } catch (e) {
        if (e.name === "_RunnerError") {
          this.ns.setTitle(
            this.ns.sprintf(
              "%s, Error: %s",
              this.getTitle(target, batchCount, batchesSinceLastError),
              e.message
            )
          );
          batchesSinceLastError = 0;
          await this.ns.sleep(100);
        } else {
          this.ns.tprint(e);
        }
      }
    }
  }

  protected getTitle(
    target: string,
    batchCount: number,
    batchesSinceLastError: number
  ) {
    const script = this.ns.getRunningScript();
    return this.ns.sprintf(
      "Batch %s (%s): %s, %s EXP: %s, MONEY: %s",
      batchCount,
      batchesSinceLastError,
      target,
      Math.round(script.onlineRunningTime),
      this.ns.formatNumber(script.onlineExpGained),
      this.ns.formatNumber(script.onlineMoneyMade)
    );
  }
}

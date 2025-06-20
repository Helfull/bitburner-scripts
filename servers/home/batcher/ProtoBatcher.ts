import { BatchRunner } from './BatchRunner';
import { RAMManager } from './RamManager';

export class ProtoBatcher extends BatchRunner {
  async loop(target: string) {
    this.log.info('Target: %s', target);
    this.ns.ui.setTailTitle(this.getTitle(target, 0, 0));
    let batchCount = 0;
    let batchesSinceLastError = 0;
    while (true) {
      try {
        this.log.info('Batch %s', batchCount);
        await this.ns.sleep(1000);

        const metrics = await super.execute(target, batchCount);

        await this.ns.sleep(1000);

        const finishTime = metrics.ends.weaken;

        this.log.info('Batch expected to finish in %s', this.ns.tFormat(finishTime));

        await this.ns.sleep(1000);

        batchCount++;
        batchesSinceLastError++;
        this.ns.ui.setTailTitle(this.getTitle(target, batchCount, batchesSinceLastError));
      } catch (e) {
        if (e.name === '_RunnerError') {
          this.ns.ui.setTailTitle(
            this.ns.sprintf('%s, Error: %s', this.getTitle(target, batchCount, batchesSinceLastError), e.message),
          );
          batchesSinceLastError = 0;
          await this.ns.sleep(100);
        } else {
          this.ns.tprint({ error: { name: e.name, message: e.message, stack: e.stack }, pid: this.ns.pid });
          throw e;
        }
      }
    }
  }

  protected getTitle(target: string, batchCount: number, batchesSinceLastError: number) {
    const script = this.ns.getRunningScript();
    return this.ns.sprintf(
      'Batch %s (%s): %s, %s EXP: %s, MONEY: %s',
      batchCount,
      batchesSinceLastError,
      target,
      Math.round(script.onlineRunningTime),
      this.ns.formatNumber(script.onlineExpGained),
      this.ns.formatNumber(script.onlineMoneyMade),
    );
  }

  protected async wait() {
    this.log.info('Waiting for finish signal');

    do {
      const portData = this.ns.readPort(this.ns.pid);

      if (portData === 'NULL PORT DATA') {
        await this.ns.sleep(1);
        continue;
      }
      try {
        switch (portData.type) {
          case 'finish':
            this.log.success('Finish signal received');
            return;
          case 'delay':
            this.log.info(
              'Delay signal received job %s is delayed by %s and finishes in %s',
              portData.job.script,
              portData.delay,
              this.ns.tFormat(portData.delay + portData.job.timings.duration, true),
            );
            continue;
          case 'hack':
          case 'grow':
          case 'weaken':
            this.log.info('Received %s signal with result: %s', portData.type, portData.result);
            continue;
          case 'late':
            this.log.warn(
              'Late signal received job %s is late by %s and finishes in %s',
              portData.job.script,
              portData.delay,
              this.ns.tFormat(portData.delay + portData.job.timings.duration, true),
            );
            continue;
          default:
            this.log.info('Port data: %s', JSON.stringify(portData, null, 2));
        }
      } catch (e) {
        this.log.error(
          'Failed to parse port data: %s',
          JSON.stringify({
            error: {
              message: e.message,
              stack: e.stack,
            },
            portData,
          }),
        );
      }
    } while (true);
  }
}

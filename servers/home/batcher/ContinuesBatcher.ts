import { getServers } from '@/servers/home/cnc/lib';
import { BatchRunner } from './BatchRunner';
import {
  HAS_MAX_MONEY,
  HAS_MIN_SECURITY,
  HAS_MONEY,
  IS_GOOD_TARGET,
  IS_HACKABLE,
  IS_NOT_HOME,
  IS_NOT_PRIVATE,
} from '@/servers/home/server/filter';
import { BY_WEIGHT } from '@/servers/home/server/sort';

export class ContinuesBatcher extends BatchRunner {
  private targettingThreadHandle: number;

  async loop(target: string, loop = true) {
    this.log.info('Target: %s', target);
    this.ns.ui.setTailTitle(this.getTitle(target, 0, 0));
    let batchCount = 0;
    let batchesSinceLastError = 0;
    do {
      await this.ns.sleep(200);
      try {
        this.log.info('Batch %s', batchCount);
        const metrics = await super.execute(target, batchCount);
        const finishTime = metrics.ends.weaken;

        this.log.info('Batch expected to finish in %s', this.ns.tFormat(finishTime));
        batchCount++;
        batchesSinceLastError++;
        this.ns.ui.setTailTitle(this.getTitle(target, batchCount, batchesSinceLastError));
      } catch (e) {
        if (e.name === '_RunnerError') {
          this.log.error('[%s][CONTINUES_RUNNER_ERROR] %s', this.ns.pid, e.message);
          this.ns.ui.setTailTitle(
            this.ns.sprintf('%s, Error: %s', this.getTitle(target, batchCount, batchesSinceLastError), e.message),
          );
          batchesSinceLastError = 0;
          await this.ns.sleep(100);
        } else {
          this.log.error('[%s][%s][CONTINUES_RUNNER_ERROR_UNKOWN] %s', e.name, this.ns.pid, e.message);
          this.log.error(
            JSON.stringify({ error: { name: e.name, message: e.message, stack: e.stack }, pid: this.ns.pid }),
          );
          throw e;
        }
      }
    } while (loop);
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

  public async autoTarget() {
    while (true) {
      await this.ns.sleep(100);

      const targets = getServers(this.ns)
        .filter(IS_NOT_PRIVATE(this.ns))
        .filter(IS_NOT_HOME(this.ns))
        .filter(HAS_MONEY(this.ns))
        .filter(IS_GOOD_TARGET(this.ns))
        .filter(IS_HACKABLE(this.ns))
        .filter(HAS_MAX_MONEY(this.ns))
        .filter(HAS_MIN_SECURITY(this.ns))
        .sort(BY_WEIGHT(this.ns));

      if (targets.length === 0) {
        this.ns.ui.setTailTitle('No targets found, sleeping');
        await this.ns.share();
        continue;
      }
      const target = targets.shift();
      await this.loop(target, false);
    }
  }
}

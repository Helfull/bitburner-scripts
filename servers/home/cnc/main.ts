import { config } from '../config';
import { Logger } from '../tools/logger';
import { setupDefault } from './lib';

export async function main(ns: NS) {
  const args = setupDefault(ns);
  ns.clearLog();

  const log = new Logger(ns);

  const handle = ns.getPortHandle(config.cncPort);

  let messageLog = [];

  ns.print('Starting up main listener');

  while (true) {
    while (handle.empty()) {
      await ns.sleep(100);
    }

    while (!handle.empty()) {
      await ns.sleep(10);
      let message = handle.read();

      if (typeof message === 'string') {
        try {
          message = JSON.parse(handle.read());
        } catch (e) {
          log.error('Failed to parse message %s', message);
        }
      }

      try {
        const [logMessage, ...messageArgs] = formatMessage(ns, message);

        if ((messageArgs?.length || 0) === 0) {
          log.info(logMessage);
        } else {
          log.info(logMessage, ...messageArgs);
        }
      } catch (e) {
        log.error('Failed to s format message %s', JSON.stringify(message));
      }

      if (message?.timings !== undefined) {
        const timings = message.timings;
        log.info('Timings: %s', JSON.stringify(message.timings, null, 2));
        if (timings.start !== timings.expectedStart) {
          log.warn(
            'Expected start time %s, actual start time %s, diff %s',
            ns.tFormat(timings.expectedStart),
            ns.tFormat(timings.start),
            ns.tFormat(timings.start - timings.expectedStart),
          );
        }

        if (timings.end !== timings.expectedEnd) {
          log.warn(
            'Expected end time %s, actual end time %s, diff %s',
            ns.tFormat(timings.expectedEnd),
            ns.tFormat(timings.end),
            ns.tFormat(timings.end - timings.expectedEnd),
          );
        }
      }
      messageLog.push(message);
    }
  }
}

function formatMessage(ns: NS, msgData: Record<any, any>): any[] {
  let result = '';

  switch (msgData.type) {
    case 'grow':
      result = ns.formatPercent(msgData.result - 1);
      break;
    case 'hack':
      result = ns.formatNumber(msgData.result);
      break;
    case 'weaken':
      result = ns.formatPercent(msgData.result);
      break;

    default:
      return [msgData];
  }

  return [
    '%s %s %s %s %s',
    msgData.job?.args?.batchId || 'N/A',
    msgData.pid || 'N/A',
    msgData.target,
    msgData.type,
    result,
  ];
}

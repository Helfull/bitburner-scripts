import { config } from "../config";
import { Logger } from "../tools/logger";
import { setupDefault } from "./lib";

export async function main(ns: NS) {
  ns.tail();
  const args = setupDefault(ns);
  ns.clearLog();

  const log = new Logger(ns);

  const handle = ns.getPortHandle(config.cncPort);

  let messageLog = [];

  while (true) {

    if (handle.empty()) {
      await ns.sleep(100);
      continue;
    }

    while(!handle.empty()) {
      const message = handle.read();
      log.info('%s %s %s %s', ...formatMessage(ns, message));
      messageLog.push(message);
    }
  }
}

function formatMessage(ns: NS, message: string) {
  const msgData = JSON.parse(message);

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
  }

  return [msgData.pid || 'N/A', msgData.type, msgData.target, result];
}

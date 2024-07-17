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

    while (!handle.empty()) {
      const message = JSON.parse(handle.read());
      log.info("%s %s %s %s %s", ...formatMessage(ns, message));
      if (message?.timings !== undefined) {
        const timings = message.timings;
        log.info("Timings: %s", JSON.stringify(message.timings, null, 2));
        if (timings.start !== timings.expectedStart) {
          log.warn(
            "Expected start time %s, actual start time %s, diff %s",
            ns.tFormat(timings.expectedStart),
            ns.tFormat(timings.start),
            ns.tFormat(timings.start - timings.expectedStart)
          );
        }

        if (timings.end !== timings.expectedEnd) {
          log.warn(
            "Expected end time %s, actual end time %s, diff %s",
            ns.tFormat(timings.expectedEnd),
            ns.tFormat(timings.end),
            ns.tFormat(timings.end - timings.expectedEnd)
          );
        }
      }
      messageLog.push(message);
    }
  }
}

function formatMessage(ns: NS, msgData: Record<any, any>) {
  let result = "";

  switch (msgData.type) {
    case "grow":
      result = ns.formatPercent(msgData.result - 1);
      break;
    case "hack":
      result = ns.formatNumber(msgData.result);
      break;
    case "weaken":
      result = ns.formatPercent(msgData.result);
      break;
  }

  return [
    msgData.job?.args?.batchId || "N/A",
    msgData.pid || "N/A",
    msgData.target,
    msgData.type,
    result,
  ];
}

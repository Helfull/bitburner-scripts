export type Messages = {
  type: 'grow' | 'hack' | 'weaken' | 'unknown' | string;
  host?: string;
  target?: string;
  pid?: number;

  printMsg?: string;
};

export function MessageFactory(ns: NS, messageString: string): Messages {
  try {
    const msgData = JSON.parse(messageString);
    const message: Messages = {
      type: msgData.type,
      host: msgData.host,
      target: msgData.target,
      pid: msgData.pid,
    };
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
      case 'delay':
        result = ns.formatNumber(msgData.delay);
        break;

      default:
        result = JSON.stringify(msgData);
    }

    message.printMsg = ns.sprintf('%s %s', msgData.job?.args?.batchId || 'N/A', result);

    return message;
  } catch (e) {
    return {
      type: 'unknown',
      printMsg: JSON.stringify(messageString),
    };
  }
}

import { RunOptions, ScriptArg } from 'NetscriptDefinitions';

const dodgeScript = 'lib/ram-dodge.js';
const serverListScript = 'lib/findServer.js';

export async function proxyNs(ns: NS, func: NSFunctionNames, ...args: any[]) {
  const ramCost = ns.getFunctionRamCost(func as string) + 1.6;
  return proxy(ns, dodgeScript, ramCost, func, ...args);
}

export async function proxy(ns: NS, script: string, ramCost: number, ...args: any[]) {
  const executeOn = await exec(ns, serverListScript, 'home', 1, ramCost);
  await copyToHost(ns, script, executeOn);
  return await exec(ns, script, executeOn, ramCost, ...args);
}

export async function copyToHost(ns: NS, script: string, host: string) {
  const funcFileExistsCost = ns.getFunctionRamCost('fileExists') + 1.6;
  const funcScpCost = ns.getFunctionRamCost('scp') + 1.6;
  if (!(await exec(ns, dodgeScript, 'home', funcFileExistsCost, 'fileExists', script, host))) {
    return await exec(ns, dodgeScript, 'home', funcScpCost, 'scp', script, host, 'home');
  }
  return true;
}

export async function exec(ns: NS, script: string, host: string, ramCost: number, ...args: ScriptArg[]): any {
  return await execRun(ns, script, host, {
    threads: 1,
    ramOverride: ramCost,
    temporary: true,
  }, ...args);
}

export async function execRun(ns: NS, script: string, host: string, threadOrOptions?: RunOptions, ...args: ScriptArg[]): any {
  if (threadOrOptions.ramOverride < 1.6) {
    threadOrOptions.ramOverride = ns.getScriptRam(script, host);
  }
  const pid = ns.exec(script, host, threadOrOptions, ...args);

  if (script !== dodgeScript && script !== serverListScript) {
    return pid;
  }

  const port = ns.getPortHandle(pid);
  await port.nextWrite();
  return port.read();
}

export async function main(ns: NS) {
  const func = ns.args[0] as string;
  let nsFunc: any = ns;
  for (let path of func.split('.')) {
    if (nsFunc[path] === undefined) {
      ns.tprint(`Function ${func} not found in NS`);
      return;
    }
    nsFunc = nsFunc[path];
  }
  const result = await nsFunc(...ns.args.slice(1));
  ns.atExit(() => {
    ns.getPortHandle(ns.pid).write(result);
  });
}


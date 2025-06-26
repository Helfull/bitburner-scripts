import { RunOptions, ScriptArg } from 'NetscriptDefinitions';

const awaitResponseScripts = ['lib/findMostRam.js', 'lib/ram-dodge.js', 'lib/findServer.js'];

export async function proxyNs(ns: NS, func: NSFunctionNames, ...args: any[]) {
  const ramCost = ns.getFunctionRamCost(func as string) + 1.6;
  return proxy(ns, 'lib/ram-dodge.js', { ramOverride: ramCost, threads: 1 }, func, ...args);
}

export async function proxy(ns: NS, script: string, options: RunOptions, ...args: any[]) {
  const executeOn = await exec(ns, 'lib/findServer.js', 'home', { threads: 1 }, options.ramOverride * options.threads, '--wait');
  await copyToHost(ns, script, executeOn);
  return await exec(ns, script, executeOn, options, ...args);
}

export async function copyToHost(ns: NS, script: string, host: string) {
  const funcFileExistsCost = ns.getFunctionRamCost('fileExists') + 1.6;
  const funcScpCost = ns.getFunctionRamCost('scp') + 1.6;
  if (!(await exec(ns, 'lib/ram-dodge.js', 'home', { ramOverride: funcFileExistsCost }, 'fileExists', script, host))) {
    return await exec(ns, 'lib/ram-dodge.js', 'home', { ramOverride: funcScpCost }, 'scp', script, host, 'home');
  }
  return true;
}

export async function exec(ns: NS, script: string, host: string, options: RunOptions, ...args: ScriptArg[]): any {
  return await execRun(ns, script, host, { temporary: true, ...options }, ...args);
}

export async function execRun(ns: NS, script: string, host: string, threadOrOptions?: RunOptions, ...args: ScriptArg[]): any {
  if (!threadOrOptions.ramOverride  || threadOrOptions.ramOverride < 1.6) {
    threadOrOptions.ramOverride = ns.getScriptRam(script, host);
  }
  const pid = ns.exec(script, host, threadOrOptions, ...args);

  if (pid === 0) {
    return 0;
  }

  if (! awaitResponseScripts.includes(script)) {
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
      return;
    }
    nsFunc = nsFunc[path];
  }
  const result = await nsFunc(...ns.args.slice(1));
  ns.atExit(() => {
    ns.getPortHandle(ns.pid).write(result);
  });
}


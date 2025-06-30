export async function main(ns: NS) {
  const endTime = ns.args[1] || 0;
  const runTime = ns.args[2] || 0;
  const signalPort: number|false = ns.args[3] as number ?? false;
  let delay = endTime - runTime - Date.now();
  if (delay < 0) {
    delay = 0;
  }
  const hackResult = await ns.hack(ns.args[0] as string, {
    additionalMsec: isNaN(delay) ? 0 : delay,
  });
  ns.atExit(() => {
    if (signalPort === false) {
        return;
    }
    ns.writePort(signalPort, JSON.stringify({ type: 'hack', delay, endTime, now: Date.now(), result: hackResult }));
  }, 'finished-signal');
}
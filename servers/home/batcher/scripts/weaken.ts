export async function main(ns: NS) {
  const endTime = ns.args[1] || 0;
  const runTime = ns.args[2] || 0;
  let delay = endTime - runTime - Date.now();
  if (delay < 0) {
    ns.tprint("Error: Negative delay calculated for grow operation.");
    delay = 0;
  }
  await ns.weaken(ns.args[0] as string, {
    additionalMsec: isNaN(delay) ? 0 : delay,
  });
}
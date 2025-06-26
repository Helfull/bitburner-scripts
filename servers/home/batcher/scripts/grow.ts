export async function main(ns: NS) {
  const endTime = ns.args[1];
  const runTime = ns.args[2];
  let delay = endTime - runTime - Date.now();
  if (delay < 0) {
    delay = 0;
  }
  await ns.grow(ns.args[0] as string, {
    additionalMsec: isNaN(delay) ? 0 : delay,
  });
}
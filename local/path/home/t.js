// servers/home/t.ts
async function main(ns) {
  const target = ns.args[0];
  const server = ns.getServer(target);
  const scriptMem = ns.getScriptRam("cnc/target.js");
  if (server.maxRam - server.ramUsed < scriptMem) {
    ns.tprint(`Not enough RAM to run target.js on ${target}`);
    return;
  }
  ns.run("cnc/target.js", 1, target);
}
export {
  main
};

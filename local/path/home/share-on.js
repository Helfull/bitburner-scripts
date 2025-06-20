// servers/home/share-on.ts
async function main(ns) {
  const target = ns.args[0];
  ns.scp("share.js", target, "home");
  while (true) {
    let availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
    const threads = Math.floor(availableRam / ns.getScriptRam("share.js"));
    if (threads > 0) {
      ns.exec(
        "share.js",
        target,
        Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam("share.js"))
      );
    }
    await ns.sleep(1e3);
  }
}
export {
  main
};

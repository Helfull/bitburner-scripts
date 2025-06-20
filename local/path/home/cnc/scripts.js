// servers/home/cnc/scripts.ts
function isRunningByName(ns, scriptName, host) {
  const script = ns.ps(host).find((p) => p.filename === scriptName);
  return script ? script.pid : null;
}
function isRunningExact(ns, scriptName, host, args) {
  const script = ns.ps(host).find((p) => p.filename === scriptName && p.args.join(" ") === args.join(" "));
  return script ? script.pid : null;
}
export {
  isRunningByName,
  isRunningExact
};

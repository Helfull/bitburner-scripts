// servers/home/clearFiles.ts
async function main(ns) {
  const files = ns.ls(ns.getHostname());
  files.filter((file) => file.endsWith(".js")).filter((file) => file !== "clearFiles.js").forEach((file) => ns.rm(file));
}
export {
  main
};

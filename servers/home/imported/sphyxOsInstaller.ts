/** @param {NS} ns */
export async function main(ns) {
  ns.rm("SphyxOS.txt")
  await ns.wget("https://gist.githubusercontent.com/Sphyxis/95cc8395158fafabdd467ec7c3e706d9/raw", "SphyxOS.txt")
  const collection = JSON.parse(ns.read("SphyxOS.txt"))
  for (const item of collection) {
    ns.write(item.filename, JSON.parse(item.file), "w")
  }
  ns.tprintf("Now, run Loader.js")
}
import { NS } from "../../NetscriptDefinitions";
import { weight } from "cnc/lib";

export function getRunningScripts(ns: NS, server: string, script: string) {
  return ns.ps(server).filter(p => p.filename === script);
}

export function needsPrepping(ns: NS, server: string) {
    return ns.getServerMoneyAvailable(server) < ns.getServerMaxMoney(server)
    || ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server)

}

export function weightSort(ns: NS, a: string, b: string) {
    return weight(ns, b) - weight(ns, a);
}

export function hasFilter(flags: ReturnType<NS['flags']>, filter: string, value: boolean) {
  const posFilter = (flags.filters as string[]).includes(filter);
  const negFilter = (flags.filters as string[]).includes(`!${filter}`);
  return (
    (posFilter && value) ||
    (negFilter && !value) ||
    (!posFilter && !negFilter)
  );
}
import { NS, Server } from "../../NetscriptDefinitions";
import { weight } from "../cnc/lib";
import { getHostname } from "./utils";

export const BY_RAM_USAGE = (ns: NS) => (a: string | Server, b: string  | Server) => ns.getServerUsedRam(getHostname(ns, b)) - ns.getServerUsedRam(getHostname(ns, a));
export const BY_WEIGHT = (ns: NS) => (a: string | Server, b: string  | Server) => weight(ns, getHostname(ns, b)) - weight(ns, getHostname(ns, a));
export const BY_HACKABLE = (ns: NS) => (a: string | Server, b: string  | Server) => ns.getServerRequiredHackingLevel(getHostname(ns, a)) - ns.getServerRequiredHackingLevel(getHostname(ns, b));
export const BY_RAM_USAGE_PERCENTAGE = (ns: NS) => (a: Server, b: Server) => (a.ramUsed / a.maxRam) - (b.ramUsed / b.maxRam);

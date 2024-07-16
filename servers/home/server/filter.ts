import { Server } from "../../../NetscriptDefinitions";
import { config } from "../config";
import { getHostname } from "./utils";

export const CAN_HACK = (ns: NS) => (server: string | Server) => ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
export const IS_HACKABLE = CAN_HACK;
export const CAN_HAVE_MONEY = (ns: NS) => (server: string | Server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;

export const HAS_ADMIN_ACCESS = (ns: NS) => (server: string | Server) => ns.hasRootAccess(getHostname(ns, server));
export const HAS_NO_ADMIN_ACCESS = (ns: NS) => (server: string | Server) => !ns.hasRootAccess(getHostname(ns, server));
export const HAS_MONEY = (ns: NS) => (server: string | Server) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
export const HAS_MAX_MONEY = (ns: NS) => (server: string | Server) => ns.getServerMoneyAvailable(getHostname(ns, server)) >= ns.getServerMaxMoney(getHostname(ns, server));
export const HAS_NOT_MAX_MONEY = (ns: NS) => (server: string | Server) => !HAS_MAX_MONEY(ns)(server);
export const HAS_MIN_SECURITY = (ns: NS) => (server: string | Server) => ns.getServerSecurityLevel(getHostname(ns, server)) <= ns.getServerMinSecurityLevel(getHostname(ns, server));
export const HAS_NOT_MIN_SECURITY = (ns: NS) => (server: string | Server) => !HAS_MIN_SECURITY(ns)(server);

export const IS_PRIVATE = (ns: NS) => (server: string | Server) => getHostname(ns, server).startsWith(config.prefixPrivate);
export const IS_NOT_PRIVATE = (ns: NS) => (server: string | Server) => !IS_PRIVATE(ns)(server);
export const IS_HOME = (ns: NS) => (server: string | Server) => getHostname(ns, server) === 'home';
export const IS_NOT_HOME = (ns: NS) => (server: string | Server) => !IS_HOME(ns)(server);
export const IS_PREPPED = (ns: NS) => (server: string | Server) => HAS_MAX_MONEY(ns)(server) && HAS_MIN_SECURITY(ns)(server);

export const NEEDS_PREP = (ns: NS) => (server: string | Server) => HAS_NOT_MAX_MONEY(ns)(server) || HAS_NOT_MIN_SECURITY(ns)(server);

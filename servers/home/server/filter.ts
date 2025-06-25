import { config } from '../config';
import { getHostname, ramAvailable, ServerString } from './utils';
export const CAN_HACK = (ns: NS) => (server: ServerString) =>
  CAN_BE_NUKED(ns)(server) && HAS_ADMIN_ACCESS(ns)(server);
export const IS_HACKABLE = CAN_HACK;
export const CAN_HAVE_MONEY = (ns: NS) => (server: ServerString) =>
  ns.getServerMaxMoney(getHostname(ns, server)) > 0;
export const HAS_MAX_PORTS = (ns: NS, maxPorts: number) => (server: ServerString) =>
  ns.getServerNumPortsRequired(getHostname(ns, server)) <= maxPorts;
export const CAN_BE_NUKED = (ns: NS) => (server: ServerString) =>
  ns.getServerRequiredHackingLevel(getHostname(ns, server)) <= ns.getHackingLevel();
export const IS_GOOD_TARGET = (ns: NS) => (server: ServerString) =>
  ns.getServerRequiredHackingLevel(getHostname(ns, server)) / 2 <= ns.getHackingLevel();
export const HAS_RAM_AVAILABLE = (ns: NS) => (server: ServerString) =>
  ns.getServerMaxRam(getHostname(ns, server)) > 0 && ns.getServerUsedRam(getHostname(ns, server)) < ns.getServerMaxRam(getHostname(ns, server));
export const HAS_ADMIN_ACCESS = (ns: NS) => (server: ServerString) =>
  ns.hasRootAccess(getHostname(ns, server));
export const HAS_NO_ADMIN_ACCESS = (ns: NS) => (server: ServerString) => !HAS_ADMIN_ACCESS(ns)(server);
export const HAS_MONEY = (ns: NS) => (server: ServerString) => ns.getServerMaxMoney(getHostname(ns, server)) > 0;
export const HAS_MAX_MONEY = (ns: NS) => (server: ServerString) =>
  ns.getServerMoneyAvailable(getHostname(ns, server)) >= ns.getServerMaxMoney(getHostname(ns, server));
export const HAS_NOT_MAX_MONEY = (ns: NS) => (server: ServerString) => !HAS_MAX_MONEY(ns)(server);
export const HAS_MIN_SECURITY = (ns: NS) => (server: ServerString) =>
  ns.getServerSecurityLevel(getHostname(ns, server)) <= ns.getServerMinSecurityLevel(getHostname(ns, server));
export const HAS_NOT_MIN_SECURITY = (ns: NS) => (server: ServerString) => !HAS_MIN_SECURITY(ns)(server);
export const HAS_AVAILABLE_RAM = (ns: NS, ram: number) => (server: ServerString) => HAS_RAM_AVAILABLE(ns)(server) && ramAvailable(ns, server) > ram;
export const IS_PRIVATE = (ns: NS) => (server: ServerString) =>
  getHostname(ns, server).startsWith(config.prefixPrivate);
export const IS_NOT_PRIVATE = (ns: NS) => (server: ServerString) => !IS_PRIVATE(ns)(server);
export const IS_HOME = (ns: NS) => (server: ServerString) => getHostname(ns, server) === 'home';
export const IS_NOT_HOME = (ns: NS) => (server: ServerString) => !IS_HOME(ns)(server);
export const IS_PREPPED = (ns: NS) => (server: ServerString) =>
  HAS_MAX_MONEY(ns)(server) && HAS_MIN_SECURITY(ns)(server);

export const NEEDS_PREP = (ns: NS) => (server: ServerString) =>
  HAS_NOT_MAX_MONEY(ns)(server) || HAS_NOT_MIN_SECURITY(ns)(server);

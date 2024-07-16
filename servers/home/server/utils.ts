import { NS, Server } from "../../NetscriptDefinitions";

export function getHostname(ns: NS, server: string | Server): string {
  if (typeof server === 'string') return server;
  return server.hostname;
}

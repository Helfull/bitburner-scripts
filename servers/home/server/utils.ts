import { Server } from '@/NetscriptDefinitions';
import { execCommand } from '@lib/utils';

export function tap<T>(obj: T, cb: (obj: T) => void): T {
  cb(obj)
  return obj;
}

export function getHostname(ns: NS, server: string | Server): string {
  if (typeof server === 'string') return server;
  return server.hostname;
}

export function ramAvailable(ns: NS, server: ServerString) {
  return Math.floor(ns.getServerMaxRam(getHostname(ns, server)) - ns.getServerUsedRam(getHostname(ns, server)));
}

export function connect(ns: NS, server: string | Server): void {
  const hostname = getHostname(ns, server);
  execCommand(`connect ${hostname}`);
}

export function backdoor(ns: NS, server: string | Server): void {
  const hostname = getHostname(ns, server);
  execCommand(`backdoor ${hostname}`);
}

import { NS } from '@ns';
import { getServers } from 'cnc/lib';

export async function main(ns: NS) {
  const servers = getServers(ns)
    .filter(s => s !== 'home')
    .map(s => ({
      hostname: s,
      files: ns.ls(s).filter(f => f.endsWith('.lit') || f.endsWith('.msg')),
    }))
    .filter(s => s.files.length > 0);

  servers.forEach(s => ns.tprintf('%s: %s', s.hostname, s.files.join(', ')));
  servers.forEach(s => ns.scp(s.files, 'home', s.hostname));
  servers.forEach(s => s.files.forEach(f => ns.rm(f, s.hostname)));
}
import { Message } from 'esbuild';
import { Port } from '@/servers/home/network/Port';
import { tap } from '@/servers/home/server/utils';

export class Network {

  protected connectedPorts: { [number: number]: Port } = {};

  constructor(protected ns: NS) {}

  connect(port: number) {
    this.connectedPorts[port] = tap(new Port(this.ns, port), (p) => {
      p.connect();
      p.onDisconnect(() => delete this.connectedPorts[port]);
    });
  }

  disconnect(port: number) {
    this.connectedPorts[port].disconnect();
  }

}
class Server {
  name: string;
  parent?: string;
  children?: Server[];

  constructor(name: string, parent: string = null, children: Server[] = []) {
    this.name = name;
    this.parent = parent;
    this.children = children;
  }

  get allChildren(): string[] {
    return this.children.flatMap(child => [child.name, ...child.allChildren]);
  }

  find(name: string): Server | null {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const found = child.find(name);
      if (found) {
        return found;
      }
    }
    return null;
  }

  reversePathTo(name: string): string[] {
    const path: string[] = [];
    let current: Server | null = this.find(name);

    while (current) {
      path.unshift(current.name);
      current = this.find(current.parent);
    }

    return path;
  }
}

export function createServerTree(ns: NS, filters: (servers: string[]) => string[]): Server {
  const root: Server = newServer('home');

  const servers = filters(ns.scan(root.name));

  root.children = servers.map(server => {
    return parseServer(ns, server, root);
  });

  return root;
}

function parseServer(ns: NS, serverName: string, parent: Server): Server {
  const server: Server = newServer(serverName, parent.name);

  const children = ns.scan(server.name)
    .filter(child => child !== server.name && child !== parent.name);

  server.children = children.map(child => parseServer(ns, child, server));

  return server;
}

function newServer(name: string, parent: string = null, children: Server[] = []): Server {
  return new Server(name, parent, children);
}
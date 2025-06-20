// servers/home/lib/serverTree.ts
var Server = class {
  name;
  parent;
  children;
  constructor(name, parent = null, children = []) {
    this.name = name;
    this.parent = parent;
    this.children = children;
  }
  get allChildren() {
    return this.children.flatMap((child) => [child.name, ...child.allChildren]);
  }
  find(name) {
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
  reversePathTo(name) {
    const path = [];
    let current = this.find(name);
    while (current) {
      path.unshift(current.name);
      current = this.find(current.parent);
    }
    return path;
  }
};
function createServerTree(ns, filters) {
  const root = newServer("home");
  const servers = filters(ns.scan(root.name));
  root.children = servers.map((server) => {
    return parseServer(ns, server, root);
  });
  return root;
}
function parseServer(ns, serverName, parent) {
  const server = newServer(serverName, parent.name);
  const children = ns.scan(server.name).filter((child) => child !== server.name && child !== parent.name);
  server.children = children.map((child) => parseServer(ns, child, server));
  return server;
}
function newServer(name, parent = null, children = []) {
  return new Server(name, parent, children);
}
export {
  createServerTree
};

import { NS } from "../../NetscriptDefinitions";
import { getServers, weight } from "cnc/lib";
import { RAMManager } from "batcher/RamManager";

export class Targetting {
  constructor(
    private readonly ns: NS,
    private readonly rmm: RAMManager,
  ) {}

  getTargetsByWeight(topN = 5) {
    return getServers(this.ns)
      .sort((a, b) => weight(this.ns, b) - weight(this.ns, a))
      .slice(0, topN);
  }
}
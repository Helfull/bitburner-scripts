import {NS} from '@ns';
import { printTable } from 'cnc/lib';

export async function main(ns: NS) {

  const data = ns.infiltration
    .getPossibleLocations()
    .map((location) => ns.infiltration.getInfiltration(location.name))
    .sort((a, b) => b.reward.tradeRep - a.reward.tradeRep)
    .reduce((acc, location) => {
      acc.location.push(location.location.name);
      acc.city.push(location.location.city);
      acc.tradeRep.push(ns.formatNumber(location.reward.tradeRep));
      acc.sellCash.push(ns.formatNumber(location.reward.sellCash));
      acc.SoARep.push(ns.formatNumber(location.reward.SoARep));
      acc.difficulty.push(ns.formatNumber(location.difficulty));
      return acc;
    }, {
      location: [] as string[],
      city: [] as string[],
      difficulty: [] as string[],
      tradeRep: [] as string[],
      sellCash: [] as string[],
      SoARep: [] as string[],
    });

  ns.tprint(printTable(data));

  while (true) {
    await ns.share();
  }

}
import { defineScript } from '@lib/flags';
import { printTable, printTableObj } from '@lib/table';
import { execCommand } from '@lib/utils';

export async function main(ns: NS) {
  ns.ui.openTail();
  await ns.sleep(1000);
  execCommand(" ;connect home ;connect foodnstuff ;connect CSEC ;connect phantasy ;connect avmnite-02h ;backdoor");
}

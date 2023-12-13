import { NS } from "@ns";
import { checkmark } from "./lib/str";
import { printTable } from "./cnc/lib";

export async function main(ns: NS) {
  ns.tprintf(printTable({
    test1: [checkmark(true), checkmark(false)],
    test2: [checkmark(false), checkmark(true)],
  }))
}
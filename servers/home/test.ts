import { defineScript } from '@lib/flags';
import { printTable, printTableObj } from '@lib/table';

export async function main(ns: NS) {
  const script = defineScript(ns, {
    description: 'Test script',
    flags: {},
    args: {}
  });


}

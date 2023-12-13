import { NS } from '@ns';
import { Batch } from 'cnc/batcher/batch';

export async function main(ns:NS) {
  const flags = ns.flags([
    ['target', 'n00dles'],
    ['batches', 1],
  ]);

  const target = flags.target as string;
  const batches = flags.batches as number;

  const batch = new Batch(ns);
  let batchData =  batch.runBatch('home', target);

  const pids: {
    [key: number]: number[];
  } = {
    0: batchData.pids,
  };

  for (let i = 1; i < batches; i++) {
    batchData = batch.runBatch('home', target, Date.now() - batchData.start + 1000,  ns.sprintf('%s / %s', i, batches));
    ns.tprintf('INFO | Batch will take %s', ns.tFormat(batchData.finish - batchData.start));
    ns.tprintf('INFO | Batch will finish at %s', new Date(batchData.finish).toISOString());
    pids[i] = batchData.pids;
    await ns.sleep(20);
  }

  while(true) {
    const now = Date.now();
    const finishedBatch = Object.keys(pids).filter((key) => {
      const batch = pids[Number(key)];
      return batch.every((pid) => !ns.isRunning(pid));
    });

    for (const batch of finishedBatch) {
      ns.tprintf('INFO | Batch %s finished at %s', batch, new Date(now).toISOString());
      delete pids[Number(batch)];
    }

    if (Object.keys(pids).length === 0) {
      break;
    }

    await ns.sleep(1000);
  }

  ns.exec('cnc/batch.js', 'home', 1, ...ns.args);
}

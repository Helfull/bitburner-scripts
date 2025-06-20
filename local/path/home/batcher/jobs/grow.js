// servers/home/config.js
var config = {
  progression: {
    backdoorsRequired: [
      "CSEC",
      "avmnite-02h",
      "I.I.I.I",
      "run4theh111z",
      "the-hub",
      "w0r1d_d43m0n"
    ]
  },
  cncPort: 5280,
  rmmPort: 5281,
  // Which server is the hacklvl farm
  farmTarget: ["foodnstuff", "n00dles", "sigma-cosmetics", "joesguns", "hong-fang-tea"],
  farmRamPercentage: 0.7,
  farmHost: "home",
  // The prefix for private servers
  prefixPrivate: "pserv-",
  privateServers: {
    maxCount: -2
  },
  // Max ram tier,
  maxRamTier: 20,
  // RAM Manager
  homeRamPercentage: (maxRam) => {
    if (maxRam < 8) {
      return 0;
    }
    if (maxRam < 16) {
      return 0.2;
    }
    if (maxRam < 32) {
      return 0.3;
    }
    if (maxRam < 64) {
      return 0.4;
    }
    return maxRam * 0.5;
  },
  // Prepper
  prep: {},
  // Proto
  proto: {
    greed: 0.5
  },
  hacknet: {
    // The amount of money that should be kept in the player's account
    // as a buffer after doing a purchase
    moneyPercentageBuffer: 0.5
  }
};

// servers/home/cnc/client.ts
async function trySend(ns, message, repeat = 10) {
  const handle = ns.getPortHandle(config.cncPort);
  for (let i = 0; i < repeat; i++) {
    if (handle.tryWrite(message)) {
      return true;
    }
    await ns.sleep(100);
  }
  return false;
}

// servers/home/batcher/jobs/utils.ts
async function calcDelay(ns, job) {
  if (job.timings === void 0)
    return 0;
  const delay = job.timings.end - job.timings.duration - Date.now();
  if (delay < 0) {
    ns.writePort(job.args.controllerPort || config.cncPort, { type: "late", delay: -delay, job });
    return 0;
  }
  ns.writePort(job.args.controllerPort || config.cncPort, { type: "delay", delay, job });
  return delay;
}

// servers/home/batcher/jobs/grow.ts
async function main(ns) {
  const job = JSON.parse(ns.args[0]);
  let delay = await calcDelay(ns, job);
  const growValue = await ns.grow(job.args.target, {
    additionalMsec: delay
  });
  ns.writePort(job.args.controllerPort || config.cncPort, {
    type: "grow",
    pid: ns.pid,
    target: job.args.target,
    result: ns.formatPercent(growValue) + " " + ns.getServerMoneyAvailable(job.args.target),
    job
  });
  await trySend(
    ns,
    JSON.stringify({
      type: "grow",
      pid: ns.pid,
      target: job.args.target,
      result: growValue,
      job
    }),
    10
  );
  ns.atExit(() => {
    ns.printf("INFO | Growing %s on %s finished", job.args.target, job.block.server);
  });
}
export {
  main
};

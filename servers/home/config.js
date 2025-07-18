export const config = {

  progression: {
    backdoorsRequired: [
      'CSEC',
      'avmnite-02h',
      'I.I.I.I',
      'run4theh111z',
      'the-hub',
      'w0r1d_d43m0n',
    ],
  },

  cncPort: 5280,
  rmmPort: 5281,

  // Which server is the hacklvl farm
  farmTarget: ['foodnstuff', 'n00dles', 'sigma-cosmetics', 'joesguns', 'hong-fang-tea'],
  farmRamPercentage: 0.7,
  farmHost: 'home',

  // Reputation farm
  repShareServers: [],
  repShareAllPrivate: true,
  repSharePrivateExclude: ['pserv-1'],

  // The prefix for private servers
  prefixPrivate: 'pserv-',
  privateServers: {
    maxCount: -2,
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

    return maxRam * 0.5
  },

  // Prepper
  prep: {
  },

  // Proto
  proto: {
    greed: 0.5,
  },

  hacknet: {
    // The amount of money that should be kept in the player's account
    // as a buffer after doing a purchase
    moneyPercentageBuffer: 0.5,
  }
};

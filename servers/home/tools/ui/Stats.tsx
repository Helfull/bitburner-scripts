import React, { useContext, useState } from 'react';
import { NetscriptContext } from '@lib/MountingPoint';
import { useInterval } from '@lib/hooks/useInterval';

export function Stats() {
  const ns: NS = useContext(NetscriptContext);
  const [playerStats, setPlayerStats] = useState({
    money: 0,
    numPeopleKilled: 0,
    entropy: 0,
    totalPlaytime: 0,
  })

  useInterval(() => {
    const player = ns.getPlayer();
    setPlayerStats({
      money: player.money,
      numPeopleKilled: player.numPeopleKilled,
      entropy: player.entropy,
      totalPlaytime: player.totalPlaytime,
    });
  }, 1000);

  return <div>
    <h2>Player Stats</h2>
    <ul>
      <li>Money: {ns.formatNumber(playerStats.money)}$</li>
      <li>People Killed: {playerStats.numPeopleKilled}</li>
      <li>Entropy: {playerStats.entropy.toFixed(2)}</li>
      <li>Total Playtime: {ns.tFormat(playerStats.totalPlaytime)}</li>
    </ul>
  </div>;
}

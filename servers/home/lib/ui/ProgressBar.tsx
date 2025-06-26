import React, { useContext } from 'react';
import { NetscriptContext } from '../MountingPoint';

export function ProgressBar({percent, max, current, reverseColors = false}: {percent: number, max: number, current: number, reverseColors?: boolean}) {
  const ns: NS = useContext(NetscriptContext);

  if (isNaN(percent) || isNaN(max) || isNaN(current)) {
    return <div>Invalid progress bar values</div>;
  }

  const emptyColor = reverseColors ? 'rgba(0, 255, 0, .5)' : 'rgba(255, 0, 0, .5)';
  const fillColor = reverseColors ? 'rgba(255, 0, 0, .5)' : 'rgba(0, 255, 0, .5)';

  return <div style={{
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
  }}>
    <div style={{
      position: 'absolute',
      display: 'flex',
      height: '8px',
      width: '100%',
      bottom: 0,
    }}>
      <div style={{backgroundColor: fillColor, width: ns.formatPercent(percent), height: '100%'}} />
      <div style={{backgroundColor: emptyColor, width: ns.formatPercent(1-percent), height: '100%'}} />
    </div>
    <span>{ns.sprintf('%7s', ns.formatNumber(current))}</span>
    <span>/</span>
    <span>{ns.sprintf('%7s', ns.formatNumber(max))}</span>
    <span>({ns.sprintf('%7s', ns.formatPercent(percent))})</span>
  </div>;
}

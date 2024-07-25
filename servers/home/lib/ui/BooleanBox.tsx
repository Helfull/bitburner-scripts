import React, { useContext } from 'react';
import { NetscriptContext } from '../MountingPoint';

export function BooleanBox({children, value}: {children?: React.ReactNode, value: boolean}) {
  const ns: NS = useContext(NetscriptContext);

  return <div style={{
    backgroundColor: value ? 'rgba(0, 255, 0, .5)' : 'rgba(255, 0, 0, .5)',
    textAlign: 'center',
  }}>
    {children}
  </div>;
}

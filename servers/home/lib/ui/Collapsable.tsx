import React, { useContext, useState } from "react";
import { NetscriptContext } from '../MountingPoint';

export function Collapsable({title, children, style}: {title: string, children: React.ReactNode, style?: React.CSSProperties}) {
  const [show, setShow] = useState(false);
  const ns: NS = useContext(NetscriptContext);

  return <div>
    <div onClick={() => setShow(!show)} style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      cursor: 'pointer',
      border: '1px solid black',
      backgroundColor: ns.ui.getTheme().backgroundsecondary,
      padding: '8px',
      boxSizing: 'border-box',
    }} >
      <span>{title}</span><span>{show ? '⯆' : '⯈'}</span>
    </div>
    <div style={{
      paddingLeft: '16px',
      ...style,
      display: show ? (style?.display || 'block') : 'none',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  </div>;

}

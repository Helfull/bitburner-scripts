import React, { useContext, useEffect } from 'react';
import { NetscriptContext } from '../MountingPoint';

export function Tabs({tabs}: {tabs: { [string: React.ReactNode] }}) {
  const ns: NS = useContext(NetscriptContext);
  const [ activeTab, setActiveTab ] = React.useState<string | null>(null);

  useEffect(() => {
    if (activeTab === null) {
      setActiveTab(Object.keys(tabs)[0]);
    }
  })

  return <div style={{width:'100%'}}>
    <div style={{
      display: 'flex',
      flexGrow: 1,
      backgroundColor: ns.ui.getTheme().backgroundprimary,
      borderStyle: 'solid',
      borderColor: ns.ui.getTheme().welllight
    }}>
      { Object.keys(tabs).map((key: string) => {
        return <div key={key} style={{
          padding: '5px',
          cursor: 'pointer',
          backgroundColor: activeTab === key ? ns.ui.getTheme().secondarydark : 'transparent',
        }} onClick={() => setActiveTab(key)}>{key}</div>;
      }) }
    </div>
    <div style={{width:'100%'}}>
      { Object.keys(tabs).map((key: string) => {
        if (activeTab === key) {
          return <div key={key} style={{}}>{tabs[key]}</div>;
        }

        return <></>
      }) }
    </div>
  </div>;
}

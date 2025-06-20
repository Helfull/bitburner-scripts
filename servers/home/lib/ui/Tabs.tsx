import React, { useContext } from 'react';
import { NetscriptContext } from '../MountingPoint';

export function Tabs({tabs}: {tabs: { [string: React.ReactNode] }}) {
  const [ activeTab, setActiveTab ] = React.useState<string | null>(null);
  return <div style={{width:'100%'}}>
    <div style={{display: 'flex', flexGrow: 1, backgroundColor: 'grey'}}>
      { Object.keys(tabs).map((key: string) => {
        return <div key={key} style={{
          padding: '5px',
          cursor: 'pointer',
          backgroundColor: activeTab === key ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
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

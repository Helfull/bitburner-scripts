import { isRunningByName } from "@/servers/home/cnc/scripts";
import { NetscriptContext } from "@lib/MountingPoint";
import { win } from "@lib/bbElements";
import { useInterval } from "@lib/hooks/useInterval";
import { useWindow } from "@lib/hooks/useWindow";
import { BooleanBox } from "@lib/ui/BooleanBox";
import React, { useContext, useEffect, useState } from "react";
import { Tabs } from '@lib/ui/Tabs';
import { Backdoors } from '@/servers/home/cnc/ui/tabs/Backdoors.tabs';
import { MessagesList } from '@/servers/home/cnc/ui/tabs/Messages.tabs';

export function StatusCell({active, name, pid, onClick} : {active?: boolean, name: string, pid?: number, onClick?: () => void}) {
  return <BooleanBox value={active} onClick={onClick}>
    <div style={{
      padding: '5px',
      display: 'flex',
      gap: '5px',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <span>{name}</span>
      {pid ? <span style={{
        color: 'white',
        fontSize: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '2px 2px 0 2px',
        boxSizing: 'border-box',
      }}>{pid}</span> : null}
    </div>
  </BooleanBox>;
}

export function SystemStatus() {
  useWindow('#system-status');

  const ns: NS = useContext(NetscriptContext);

  useEffect(() => {
    ns.ui.resizeTail(1200, 500);
    ns.ui.moveTail(win.innerWidth / 2 - 512, win.innerHeight / 2 - 250, ns.pid);
    ns.ui.setTailTitle('System Status');
  }, []);

  const [status, setStatus] = useState<{[key: string]: number}>({});
  useInterval(() => {
    setStatus({
      'nuke-net': isRunningByName(ns, 'nuke-net.js', 'home'),
      'hacknet': isRunningByName(ns, 'hack-net.js', 'home'),
      'share-net': isRunningByName(ns, 'share-net.js', 'home'),
    });
  }, 1000, []);

  const tabs = {
    'Messages': <MessagesList />,
    'Backdoors': <Backdoors />,
  };

  return <div id="system-status">
    <div style={{height: '32px', width: '100%', display: 'flex', flexDirection: 'column'}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(" + Object.entries(status).length + ", 1fr)",
          justifyContent: "center",
          gap: "5px",
          color: 'white',
        }}
      >
        {Object.entries(status).map(([key, pid]) => (
          <StatusCell active={pid !== null} name={key} pid={pid} />
        ))}
      </div>
      <Tabs tabs={tabs} />
    </div>
  </div>;
}

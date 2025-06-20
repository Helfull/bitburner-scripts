import { MessageFactory, Messages } from "@/servers/home/cnc/messages/factory";
import { isRunningByName } from "@/servers/home/cnc/scripts";
import { config } from "@/servers/home/config";
import { NetscriptContext } from "@lib/MountingPoint";
import { win } from "@lib/bbElements";
import { useInterval } from "@lib/hooks/TimerHook";
import { useWindow } from "@lib/hooks/WindowHelper";
import { BooleanBox } from "@lib/ui/BooleanBox";
import React, { useContext, useEffect, useState } from "react";
import { Tabs } from '@lib/ui/Tabs';
import { execCommand } from '@lib/utils';
import { createServerTree } from '@lib/serverTree';
import { IS_NOT_PRIVATE } from '@/servers/home/server/filter';

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
      cursor: 'pointer',
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

type MessageLogProps = {
  messages: Messages[];
}
function MessageLog({ messages }: MessageLogProps) {
  return <div style={{
    height: '100%',
    overflow: 'scroll',
    border: '1px solid white',
    display: 'flex',
    flexDirection: 'column',
    padding: '5px',
    boxSizing: 'border-box',
  }}>
    {messages.slice(0, 20).map((message, index) => (
      <div style={{borderBottom: '1px solid white'}} key={index}>
        <div style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '5px',
          width: '100%',
          alignItems: 'center',
        }}>
          <span style={{
            color: "grey",
            fontSize: "10px",
          }}>{message?.pid}</span>
          <span style={{
            color: "white",
            fontSize: "10px",
          }}>{message?.type}</span>
          <span>{message?.host}</span>
          <span>{message?.target}</span>
        </div>
        <span>{message?.printMsg}</span>
      </div>
    ))}
  </div>
}

export function SystemStatus() {
  useWindow('#system-status');

  const ns: NS = useContext(NetscriptContext);

  useEffect(() => {
    ns.ui.resizeTail(1200, 500);
    ns.ui.moveTail(win.innerWidth / 2 - 512, win.innerHeight / 2 - 250, ns.pid);
    ns.ui.setTailTitle('System Status');
  }, []);

  const [messages, setMessages] = useState<Messages[]>([]);
  const [status, setStatus] = useState<{[key: string]: number}>({});
  const [backdoors, setBackdoors] = useState<{[key: string]: { value: any, onClick: () => void}}>({});

  useInterval(() => {
    const portHandle = ns.getPortHandle(config.cncPort);
    while(!portHandle.empty()) {
      setMessages((messages) => {
        return [MessageFactory(ns, portHandle.read()), ...messages];
      });
    }


    setStatus({
      'prep-all': isRunningByName(ns, 'prep-all.js', 'home'),
      'nuke-net': isRunningByName(ns, 'nuke-net.js', 'home'),
      'hacknet': isRunningByName(ns, 'hack-net.js', 'home'),
      'servers': isRunningByName(ns, 'tools/servers.js', 'home'),
    });

    const tree = createServerTree(ns, (servers: string[]) => servers.filter(IS_NOT_PRIVATE(ns)));

    const cString = (target: string) => tree.reversePathTo(target).reduce((prev, cur) => prev + ' ;connect ' + cur, '') + ' ;backdoor'

    setBackdoors({
      'avmnite-02h': { value: ns.getServer('avmnite-02h').backdoorInstalled, onClick: () => execCommand(cString('avmnite-02h')), },
      'I.I.I.I': { value: ns.getServer('I.I.I.I').backdoorInstalled, onClick: () => execCommand(cString('I.I.I.I')), },
      'run4theh111z': { value: ns.getServer('run4theh111z').backdoorInstalled, onClick: () => execCommand(cString('run4theh111z')), },
    });
  }, 1000, []);

  const tabs = {
    'Messages': <div style={{width:'100%'}}>
      <span>Port messages</span>
      <MessageLog messages={messages} />
    </div>,
    'Backdoors': <div>
      <span>Backdoors</span>
        {Object.entries(backdoors).map(([key, installed]) => (
          <div key={key}>
            <StatusCell active={installed.value} name={key} onClick={installed.onClick} />
          </div>
        ))}
      </div>
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

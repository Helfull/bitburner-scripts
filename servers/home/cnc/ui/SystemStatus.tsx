import { MessageFactory, Messages } from "@/servers/home/cnc/messages/factory";
import { isRunningByName } from "@/servers/home/cnc/scripts";
import { config } from "@/servers/home/config";
import { NetscriptContext } from "@lib/MountingPoint";
import { win } from "@lib/bbElements";
import { useInterval } from "@lib/hooks/TimerHook";
import { useWindow } from "@lib/hooks/WindowHelper";
import { BooleanBox } from "@lib/ui/BooleanBox";
import React, { useContext, useEffect, useState } from "react";

export function StatusCell({active, name, pid} : {active?: boolean, name: string, pid?: number}) {
  return <BooleanBox value={active}>
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
  const [backdoors, setBackdoors] = useState<{[key: string]: boolean}>({});

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
      'hacknet': isRunningByName(ns, 'tools/hacknet.js', 'home'),
      'servers': isRunningByName(ns, 'tools/servers.js', 'home'),
      'secWatch': isRunningByName(ns, 'secWatch.js', 'home'),
      'moneyWatch': isRunningByName(ns, 'moneyWatch.js', 'home'),
    });

    setBackdoors({
      'avmnite-02h': ns.getServer('avmnite-02h').backdoorInstalled,
      'I.I.I.I': ns.getServer('I.I.I.I').backdoorInstalled,
      'run4theh111z': ns.getServer('run4theh111z').backdoorInstalled,
    });
  }, 1000, []);

  return <div id="system-status" style={{
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "5px",
    padding: "5px",
    boxSizing: "border-box",
  }}>
    <div style={{height: '32px', width: '100%'}}>
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
    </div>
    <div style={{maxHeight: '100%', height: '90%', width: '80%'}}>
      <span>Port messages</span>
      <MessageLog messages={messages} />
    </div>
    <div style={{ width: 'calc(20% - 5px)'}}>
        <span>Backdoors</span>
        {Object.entries(backdoors).map(([key, installed]) => (
          <div key={key}>
            <StatusCell active={installed} name={key} />
          </div>
        ))}
    </div>
  </div>;
}

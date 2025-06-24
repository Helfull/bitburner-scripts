import { MessageFactory, Messages } from "@/servers/home/cnc/messages/factory";
import { config } from "@/servers/home/config";
import { NetscriptContext } from "@lib/MountingPoint";
import { useInterval } from "@lib/hooks/useInterval";
import React, { useContext, useState } from "react";

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

export function MessagesList() {
  const ns: NS = useContext(NetscriptContext);

  const [messages, setMessages] = useState<Messages[]>([]);

  useInterval(() => {
    const portHandle = ns.getPortHandle(config.cncPort);
    while(!portHandle.empty()) {
      setMessages((messages) => {
        return [MessageFactory(ns, portHandle.read()), ...messages];
      });
    }
  }, 1000, []);

  return <div style={{width:'100%'}}>
      <span>Port messages</span>
      <MessageLog messages={messages} />
    </div>;
}

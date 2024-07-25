import { RunOptions } from "@/NetscriptDefinitions";
import { NetscriptContext } from "@lib/MountingPoint";
import React, { Children, useContext } from "react";

export type RunScript = {
  scriptName: string;
  args: string[];
  host: string;
  threadOptions?: number | RunOptions;
}

export function RunWrapper({
  children,
  script
}: {
  children: React.ReactElement,
  script: RunScript
}) {
  const ns: NS = useContext(NetscriptContext);

  return <div style={{cursor: 'pointer'}} onClick={() =>{
    const pid = ns.exec(script.scriptName, script.host, typeof script.threadOptions === 'number' ? script.threadOptions : {
      ...script.threadOptions,
      preventDuplicates: true,
    }, ...script.args);
    if (pid === 0) {
      ns.alert('Failed to run ' + script.scriptName + ' on ' + script.host + ' with args ' + script.args.join(', '));
    }
  }}>{children}</div>;
}

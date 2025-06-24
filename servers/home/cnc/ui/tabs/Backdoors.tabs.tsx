import { NetscriptContext } from "@lib/MountingPoint";
import { win } from "@lib/bbElements";
import { useInterval } from "@lib/hooks/useInterval";
import { BooleanBox } from "@lib/ui/BooleanBox";
import React, { useContext, useEffect, useState } from "react";
import { createServerTree } from '@lib/serverTree';
import { IS_NOT_PRIVATE } from '@/servers/home/server/filter';
import { Programs } from '@lib/enums';
import { execCommand } from '@lib/execCommand';

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

export function Backdoors() {
  const ns: NS = useContext(NetscriptContext);

  const [backdoors, setBackdoors] = useState<{[key: string]: { value: any, onClick: () => void}}>({});
  const [programs, setPrograms] = useState<{[key: string]: { value: boolean, onClick: () => void}}>({});

  useInterval(() => {
    const tree = createServerTree(ns, (servers: string[]) => servers.filter(IS_NOT_PRIVATE(ns)));

    const cString = (target: string) => tree.reversePathTo(target).reduce((prev, cur) => prev + ' ;connect ' + cur, '') + ' ;backdoor'

    setBackdoors({
      'avmnite-02h': { value: ns.serverExists('avmnite-02h') && ns.getServer('avmnite-02h').backdoorInstalled, onClick: () => execCommand(cString('avmnite-02h')), },
      'I.I.I.I': { value: ns.serverExists('I.I.I.I') && ns.getServer('I.I.I.I').backdoorInstalled, onClick: () => execCommand(cString('I.I.I.I')), },
      'run4theh111z': { value: ns.serverExists('run4theh111z') && ns.getServer('run4theh111z').backdoorInstalled, onClick: () => execCommand(cString('run4theh111z')), },
      'CSEC': { value: ns.serverExists('CSEC') && ns.getServer('CSEC').backdoorInstalled, onClick: () => execCommand(cString('CSEC')), },
      'w0r1d_d43m0n': { value: ns.serverExists('w0r1d_d43m0n') && ns.getServer('w0r1d_d43m0n').backdoorInstalled, onClick: () => execCommand(cString('w0r1d_d43m0n')), },
    });

    const programsList = {};

    Object.keys(Programs).forEach((program: string) => {
      const programName = Programs[program as keyof typeof Programs];
      const installed = ns.fileExists(program, 'home');
      programsList[programName] = {
        value: installed,
        onClick: () => {
          execCommand(`buy -a`);
        },
      };
    })

    setPrograms(programsList);
  }, 1000, []);

  return <div>
    <span>Backdoors</span>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
    }}>
      {Object.entries(backdoors).map(([key, installed]) => (
        <div key={key}>
          <StatusCell active={installed.value} name={key} onClick={installed.onClick} />
        </div>
      ))}
    </div>
    <hr />
    <span>Programs</span>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
    }}>
      {Object.entries(programs).map(([key, installed]) => (
        <div key={key}>
          <StatusCell active={installed.value} name={key} onClick={installed.onClick} />
        </div>
      ))}
    </div>
  </div>;
}

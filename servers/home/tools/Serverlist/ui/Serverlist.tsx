import React, { useContext } from "react";
import { Columns, ServerStatus, Serverlist, ServerlistRow } from "../Serverlist";
import { NetscriptContext } from "@lib/MountingPoint";
import { ProgressBar } from "@lib/ui/ProgressBar";
import { BooleanBox } from "@lib/ui/BooleanBox";
import { Color } from "@lib/colors";
import { PrepStatus, ProtoStatus } from "@/servers/home/tools/Serverlist/ui/StatusButtons";

const FieldWrapper = ({key, children, style}) => <td key={key} style={style}><div style={{padding: '8px'}}>{children}</div></td>;

export const BooleanField = ({value, trueValue = true}: { value: any, trueValue?: string|boolean}) =>
  <BooleanBox value={value === trueValue}>{ value === trueValue ? 'Running' : 'Stopped' }</BooleanBox>;

const statusColorMap: Record<ServerStatus, string> = {
  'ERROR': 'rgb(128, 0, 0)',
  'WARN': 'rgb(128, 128, 0)',
  'OKAY': 'rgb(0, 128, 0)',
  'READY': 'rgb(0, 128, 128)',
  'PREP': 'rgb(0, 0, 128)',
  'UNKNOWN': 'rgb(128, 0, 128)',
};

const StatusField = ({value} : {value: ServerStatus}) => {
  const status = Color.unwrap(value);
  const backgroundColor = statusColorMap[status] || 'white';
  return <div style={{ padding: '8px', textAlign: 'center', backgroundColor}}>{status}</div>;
};


const getFieldComponent = (col, row: ServerlistRow) => {
  const fieldComponent = fieldMap[col];
  const value = row.data[col];

  const style = row.server === 'Total'
    ? {
      borderBottom: 'solid white 5px',
      position: 'sticky', left: 0, zIndex: 1,
    } : {};

  if (value === undefined) return <FieldWrapper style={style} key={col}>{fieldMap.default(value, col)}</FieldWrapper>;

  if (fieldComponent === undefined) {
    return <FieldWrapper style={style} key={col}>{fieldMap.default(value, col)}</FieldWrapper>;
  }

  return <FieldWrapper style={style} key={col}>{fieldComponent(value, row.server)}</FieldWrapper>
};

const fieldMap: {
  [key in Columns | 'default']?: (value: any, serverName?: string, ns?: NS) => JSX.Element;
} = {
  protoStatus: (value, serverName) => <ProtoStatus value={value} server={serverName} />,
  prepStatus: (value, serverName) => <PrepStatus value={value} server={serverName} />,
  rootAccess: (value) => <BooleanField value={value} />,
  backdoorInstalled: (value) => <BooleanField value={value} />,
  secLevel: (value) => <div style={{color: Math.abs(1 - value.percent) > 0 ? 'orange' : 'white'}}>
    <ProgressBar reverseColors={true} percent={Math.abs(1 - value.percent)} max={value.max} current={value.current} />
  </div>,
  money: (value) => <div style={{color: value.percent >= 1 ? 'white' : 'orange'}}>
    <ProgressBar percent={value.percent} max={value.max} current={value.current} />
  </div>,
  usedRamPercent: (value) => <div style={{color: value.percent > 0 ? 'orange' : 'white'}}>
    <ProgressBar percent={value.percent} max={value.max} current={value.current} />
  </div>,
  status: (value) => <StatusField value={value} />,
  default: (value, col) => {
    if (value === undefined) return col;
    try {
      return Color.unwrap(value);
    } catch (e) {
      console.error(e);
      console.warn('Could not unwrap color', value, col);
      return value;
    }
  },
};


export function ServerList({serverListState}: {serverListState: Serverlist}) {
  const ns: NS = useContext(NetscriptContext);

  const header = Object.keys(serverListState.rows[0].data || {});
  const totalRow = serverListState.rows.shift();

  return <div style={{
    color: 'white',
    fontFamily: ns.ui.getStyles().fontFamily,
    display: 'block',
    height: '100%',
    overflow: 'auto'
  }}>
    <table style={{width: '100%', borderCollapse: 'separate',}}>
      <thead style={{
        position: 'sticky', top: 0, zIndex: 1,
        backgroundColor: ns.ui.getTheme().backgroundprimary,
        border: 'solid 1px',
        borderColor: ns.ui.getTheme().backgroundsecondary,
        textAlign: 'right'
      }}>
        <tr>
          {header.map((col) => <th key={col}><div style={{padding: '16px'}}>{col}</div></th>)}
        </tr>
        <tr>
          {header.map((col) => getFieldComponent(col, totalRow))}
        </tr>
      </thead>
      {serverListState.rows.map((row, i) => (
        <tr style={{
          textAlign: 'right',
          ...(i%2 ? {
            backgroundColor: ns.ui.getTheme().backgroundprimary,
          } : {
            backgroundColor: ns.ui.getTheme().backgroundsecondary,
          }),
        }} key={i}>
          { header.map((col) => getFieldComponent(col, row)) }
        </tr>
      ))}
    </table>
  </div>
}

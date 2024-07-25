import React, { useContext } from 'react';
import { Collapsable } from './Collapsable';
import { NetscriptContext } from '../MountingPoint';
import { Checkbox } from './Checkbox';

export function MultiSelect({options, value, onselect}: {options: string[], value: string[], onselect: (value: string[]) => void}) {
  const ns: NS = useContext(NetscriptContext);
  return <div style={{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid black',
    backgroundColor: ns.ui.getTheme().backgroundsecondary,
  }}>
    {options.map((option) => (
      <div style={{
        padding: '8px',
      }} key={option}>
        <Checkbox name={option} label={option} isChecked={value.includes(option)} onChange={(checked) => {
          onselect(options.filter((v) => (checked && v === option || value.includes(v) && v !== option)));
        }} />
      </div>
    ))}
  </div>;
}

export function CollapsableMultiSelect({title, options, value, onselect}: {title: string, options: string[], value: string[], onselect: (value: string[]) => void}) {
  return <div style={{width: "100%"}}>
    <Collapsable style={{
      maxHeight: "300px", overflow: "auto",
    }} title={title}><MultiSelect options={options} value={value} onselect={onselect} /></Collapsable>
  </div>;
}

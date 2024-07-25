import React from 'react';

export const Checkbox = ({name, label, isChecked, onChange}: {name: string, label: string, isChecked: boolean, onChange: (checked: boolean) => void}) =>
  <label htmlFor={name} onClick={() => onChange(!isChecked)}><input type="checkbox" key={name} name={name} checked={isChecked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;

import { NS } from "@ns";
import React from "lib/react";

export async function terminal(ns: NS, text: string) {
  // const d = eval("document")
  const input = document.getElementById('terminal-input');

  if (!input) {
      ns.print("WARN couldn't find the terminal in document");
      return false;
  }
  // if (input.getAttribute('disabled')) { // this doesn't work
  if (input.matches(":disabled")) {
      ns.print("WARN can't write to terminal while it is busy");
      return false;
  }
  const handler = Object.keys(input)[1];
  // @ts-ignore
  input[handler].onChange({ target: { value: text } });
  // @ts-ignore
  setTimeout(() => input[handler].onKeyDown({ key: 'Enter', preventDefault: () => null }), 10);

  return true;
}

export function wrapCmdNode(ns: NS, label: string, cmd: string, styles: any = {}) {
  return React.createElement(
    'button',
    {
      className: 'jss438 css-czn5ar',
      style: {
        background: 'transparent',
        textDecoration: 'underline',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        ...styles,
      },
      onClick: (event) => {
        terminal(ns, cmd);
      }
    },
    label
);
}
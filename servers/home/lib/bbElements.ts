/**
 * This file contains all the bitburner UI elements that are used with in the scripts.
 */
export const doc: Document = eval('document');
export const win: Window = eval('window');

// The root element of the Bitburner UI
export const bbRoot = () => doc.querySelector('#root') as HTMLElement;

// The terminal input
export const bbTerminalInput = () => doc.getElementById('terminal-input') as HTMLInputElement;

// The main content container of the Bitburner UI
export const bbContainer = () => doc.querySelector('#root > div.MuiBox-root.css-1ik4laa') as HTMLElement;

// The page container
export const bbContentContainer = () =>
  doc.querySelector('#root > div.MuiBox-root.css-1ik4laa > div.MuiBox-root.css-1mojy8p-root') as HTMLElement;

// The drawer container
export const bbDrawer = () => bbRoot().querySelector('.MuiDrawer-root .MuiDrawer-paper ul') as HTMLElement;

// The network container
export const bbNetwork = () =>
  bbDrawer().querySelector('div.MuiCollapse-wrapperInner.MuiCollapse-vertical.css-8atqhb') as HTMLElement;

// The all drawer buttons
export const bbPageButtons = () =>
  bbDrawer().querySelectorAll<HTMLElement>(
    '.MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button',
  );

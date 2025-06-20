import { bbTerminalInput } from '@lib/bbElements';

export function execCommand(cmd: string) {
  const terminalInput = bbTerminalInput();
  // Get a reference to the React event handler.
  const handler = Object.keys(terminalInput)[1];
  // Perform an onChange event to set some internal values.
  terminalInput[handler].onChange({ target: { value: cmd } });
  // Simulate an enter press
    terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
  setTimeout(() => {
  }, 1)
}

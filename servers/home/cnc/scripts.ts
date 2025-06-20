/**
 * Determines if a script is running on a server by name.
 * Returns the PID of the script if it is running.
 */
export function isRunningByName(ns: NS, scriptName: string, host: string): number | null {
  const script = ns.ps(host).find((p) => p.filename === scriptName);
  return script ? script.pid : null;
}

/**
 * Determines if a script is running on a server by name and arguments.
 * Returns the PID of the script if it is running.
 */
export function isRunningExact(ns: NS, scriptName: string, host: string, args: string[]): number | null {
  const script = ns.ps(host).find((p) => p.filename === scriptName && p.args.join(' ') === args.join(' '));
  return script ? script.pid : null;
}

import { useEffect } from 'react';
import { useInterval } from '@lib/hooks/useInterval';

export function usePort(ns: NS, port: number, onWrite: (data: any) => void) {
  useInterval(() => {
    const data = ns.peek(port);
    if (data !== 'NULL PORT DATA') {
      onWrite(ns.readPort(port));
    }
  });
}

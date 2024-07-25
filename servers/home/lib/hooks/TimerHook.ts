import { useEffect } from 'react';

export function useInterval(callback: () => void, delay: number = 100, watch: any[] = []) {
  useEffect(() => {
    const intervalHandle = setInterval(() => {
      callback();
    }, delay);

    return () => clearInterval(intervalHandle);
  }, watch);
}

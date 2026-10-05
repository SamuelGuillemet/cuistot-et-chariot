import { useEffect, useRef } from 'react';

export function useDidUpdateEffect(fn: () => void, inputs: React.DependencyList) {
  const isMountingRef = useRef(false);

  useEffect(() => {
    isMountingRef.current = true;
  }, []);

  useEffect(() => {
    if (!isMountingRef.current) {
      return fn();
    } else {
      isMountingRef.current = false;
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
}

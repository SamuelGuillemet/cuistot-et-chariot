import { useEffect, useRef } from 'react';

export function useDidUpdateEffect(
  fn: () => void,
  inputs: React.DependencyList,
) {
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
    // biome-ignore lint/correctness/useExhaustiveDependencies: Custom hook
  }, inputs);
}

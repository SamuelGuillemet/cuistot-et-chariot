import * as React from 'react';

export function useIsMobile(mobileBreakpoint = 768) {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [mobileBreakpoint],
  );

  const getSnapshot = () => window.innerWidth < mobileBreakpoint;

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

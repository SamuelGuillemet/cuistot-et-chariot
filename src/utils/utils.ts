export function uniqueObject<T extends Record<string, unknown>>(key: keyof T) {
  return (value: T, index: number, self: T[]): boolean => {
    return self.findIndex((item) => item[key] === value[key]) === index;
  };
}

// Debounce helper for async functions. Collapses rapid calls and resolves all
// pending callers with the result of the last invocation after the wait.
export function debounceAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  wait: number = 200,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;
  let pending: Array<{
    resolve: (v: TResult) => void;
    reject: (e: unknown) => void;
  }> = [];

  return (...args: TArgs) => {
    lastArgs = args;
    return new Promise<TResult>((resolve, reject) => {
      pending.push({ resolve, reject });
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const waiters = pending;
        pending = [];
        timer = null;
        try {
          const result = await fn(...(lastArgs as TArgs));
          waiters.forEach((w) => w.resolve(result));
        } catch (err) {
          waiters.forEach((w) => w.reject(err));
        }
      }, wait);
    });
  };
}

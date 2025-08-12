export const ssrSafeCookieStore = {
  get: async (name: string) => {
    if (typeof window === 'undefined') return null;
    return window.cookieStore.get(name);
  },
  setWithOptions: async (options: CookieInit) => {
    if (typeof window === 'undefined') return;
    await window.cookieStore.set(options);
  },
  set: async (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    await window.cookieStore.set(name, value);
  },
};

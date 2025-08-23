import { useMutation } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, use } from 'react';
import { useThemeMutationOptions } from '@/lib/server-queries';

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
  const mutation = useMutation(useThemeMutationOptions());

  function setTheme(val: Theme) {
    mutation.mutate(val);
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error('useTheme called outside of ThemeProvider!');
  return val;
}

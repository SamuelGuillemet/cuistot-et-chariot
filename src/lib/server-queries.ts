import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import * as v from 'valibot';
import type { Theme } from '@/components/layout/theme-provider';
import { getToken } from './auth-server';

const THEME_COOKIE_NAME = 'ui-theme';
const DEFAULT_COOKIE_OPTIONS = { httpOnly: true, maxAge: 60 * 60 * 24 * 30 };

export const getAuthSessionServerFn = createServerFn({ method: 'GET' }).handler(async () => ({
  token: await getToken(),
}));

export const getThemeServerFn = createServerFn().handler(
  () => (getCookie(THEME_COOKIE_NAME) || 'system') as Theme,
);

const ThemeValidator = v.picklist(['light', 'dark', 'system']);

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator(ThemeValidator)
  .handler(({ data }) => {
    setCookie(THEME_COOKIE_NAME, data, DEFAULT_COOKIE_OPTIONS);
    return data;
  });

export const authSessionQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'session'],
    queryFn: () => getAuthSessionServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

export const themeQueryOptions = () =>
  queryOptions({
    queryKey: ['settings', 'theme'],
    queryFn: () => getThemeServerFn(),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

export const useThemeMutationOptions = () => {
  const queryClient = useQueryClient();
  return {
    mutationFn: (theme: Theme) => setThemeServerFn({ data: theme }),
    onSuccess: (data: Theme) => {
      queryClient.setQueryData(themeQueryOptions().queryKey, data);
      return data;
    },
  };
};

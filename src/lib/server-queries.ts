import {
  fetchSession,
  getCookieName,
} from '@convex-dev/better-auth/react-start';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  deleteCookie,
  getCookie,
  getRequest,
  setCookie,
} from '@tanstack/react-start/server';
import * as z from 'zod/mini';
import type { Theme } from '@/components/layout/theme-provider';
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar';

// Constants
const THEME_COOKIE_NAME = 'ui-theme';
const HOUSEHOLD_COOKIE_NAME = 'household-id';

const DEFAULT_COOKIE_OPTIONS = { httpOnly: true, maxAge: 60 * 60 * 24 * 30 };

// Server Functions
export const getAuthSessionServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { createAuth } = await import('../../convex/auth');
    const { session } = await fetchSession(getRequest());
    const sessionCookieName = getCookieName(createAuth);
    const token = getCookie(sessionCookieName);
    return {
      userId: session?.user.id,
      token,
    };
  },
);

export const getThemeServerFn = createServerFn().handler(async () => {
  return (getCookie(THEME_COOKIE_NAME) || 'system') as Theme;
});

const ThemeValidator = z.enum(['light', 'dark', 'system']);

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ThemeValidator.parse(data))
  .handler(async ({ data }) => {
    setCookie(THEME_COOKIE_NAME, data, DEFAULT_COOKIE_OPTIONS);
    return data;
  });

export const getSidebarStateServerFn = createServerFn().handler(async () => {
  return (getCookie(SIDEBAR_COOKIE_NAME) || 'false') === 'true';
});

const SidebarStateValidator = z.boolean();

export const setSidebarStateServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => SidebarStateValidator.parse(data))
  .handler(async ({ data }) => {
    setCookie(SIDEBAR_COOKIE_NAME, String(data), DEFAULT_COOKIE_OPTIONS);
    return data;
  });

export const getHouseholdIdServerFn = createServerFn().handler(async () => {
  const householdId = getCookie(HOUSEHOLD_COOKIE_NAME);
  if (householdId && !HouseholdIdValidator.safeParse(householdId).success) {
    // Invalid household ID, clear the cookie
    deleteCookie(HOUSEHOLD_COOKIE_NAME);
    return null;
  }

  return householdId || null;
});

const HouseholdIdValidator = z.union([z.guid(), z.null()]);

export const setHouseholdIdServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => HouseholdIdValidator.parse(data))
  .handler(async ({ data }) => {
    if (data === null) {
      deleteCookie(HOUSEHOLD_COOKIE_NAME);
    } else {
      setCookie(HOUSEHOLD_COOKIE_NAME, data, DEFAULT_COOKIE_OPTIONS);
    }
    return data;
  });

// Query Options
export const authSessionQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'session'],
    queryFn: () => getAuthSessionServerFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

export const themeQueryOptions = () =>
  queryOptions({
    queryKey: ['settings', 'theme'],
    queryFn: () => getThemeServerFn(),
    staleTime: 1000 * 60 * 30, // 30 minutes (theme doesn't change often)
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

export const sidebarStateQueryOptions = () =>
  queryOptions({
    queryKey: ['settings', 'sidebar'],
    queryFn: () => getSidebarStateServerFn(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

export const householdIdQueryOptions = () =>
  queryOptions({
    queryKey: ['settings', 'householdId'],
    queryFn: () => getHouseholdIdServerFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

// Mutation Options (for use with useMutation)
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

export const useSidebarMutationOptions = () => {
  const queryClient = useQueryClient();
  return {
    mutationFn: (open: boolean) => setSidebarStateServerFn({ data: open }),
    onSuccess: (data: boolean) => {
      queryClient.setQueryData(sidebarStateQueryOptions().queryKey, data);
      return data;
    },
  };
};

export const useHouseholdMutationOptions = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return {
    mutationFn: (householdId: string | null) =>
      setHouseholdIdServerFn({ data: householdId }),
    onSuccess: (data: string | null) => {
      queryClient.setQueryData(householdIdQueryOptions().queryKey, data);
      router.invalidate(); // To force reload of routes that depend on householdId
      return data;
    },
  };
};

import type { ConvexQueryClient } from '@convex-dev/react-query';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, getWebRequest } from '@tanstack/react-start/server';
import { fetchSession, getCookieName } from '@/lib/auth-server-utils';

interface Context {
  convexQueryClient: ConvexQueryClient;
  userId?: string;
  token?: string;
}

export const setupSSR = async (context: Context) => {
  let { convexQueryClient, userId, token } = context;

  if (!userId || !token) {
    const auth = await fetchAuth();
    ({ userId, token } = auth);
  }

  if (token) {
    convexQueryClient.serverHttpClient?.setAuth(token);
  }

  return { userId, token };
};

export const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionCookieName = await getCookieName();
  const token = getCookie(sessionCookieName);
  const request = getWebRequest();
  const { session } = await fetchSession(request);
  return {
    userId: session?.user.id,
    token,
  };
});

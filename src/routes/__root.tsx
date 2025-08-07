/// <reference types="vite/client" />

import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import type { ConvexQueryClient } from '@convex-dev/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { ConvexReactClient } from 'convex/react';
import { Page404 } from '@/components/404';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { authClient } from '@/lib/auth-client';
import { setupSSR } from '@/server/auth';
import { getThemeServerFn } from '@/server/theme';
import mainCss from '@/styles/main.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
  breadcrumbs?: string;
  userId?: string;
  token?: string;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [{ rel: 'stylesheet', href: mainCss }],
  }),
  component: RootComponent,
  notFoundComponent: Page404,
  beforeLoad: async (ctx) => setupSSR(ctx.context),
  loader: async () => ({
    theme: await getThemeServerFn(),
    breadcrumbs: 'Home',
  }),
  staleTime: Infinity,
});

function RootComponent() {
  const data = Route.useLoaderData();
  const context = useRouteContext({ from: Route.id });

  return (
    <ThemeProvider theme={data.theme}>
      <ConvexBetterAuthProvider
        client={context.convexClient}
        authClient={authClient}
      >
        <RootDocument />
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  );
}

function RootDocument() {
  const data = Route.useLoaderData();

  return (
    <html lang="fr" suppressHydrationWarning className={data.theme}>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <Layout />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

/// <reference types="vite/client" />

import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import type { ConvexQueryClient } from '@convex-dev/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { ConvexReactClient } from 'convex/react';
import type { PropsWithChildren } from 'react';
import { Page404 } from '@/components/404';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/sonner';
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
      {
        title: 'Cuistot et Chariot',
      },
    ],
    links: [{ rel: 'stylesheet', href: mainCss }],
  }),
  component: RootComponent,
  notFoundComponent: Page404,
  beforeLoad: async (ctx) => setupSSR(ctx.context),
  loader: async () => ({
    breadcrumbs: null,
    theme: await getThemeServerFn(),
  }),
});

function RootComponent() {
  const data = Route.useLoaderData();
  const context = Route.useRouteContext();

  return (
    <ThemeProvider theme={data.theme}>
      <ConvexBetterAuthProvider
        client={context.convexClient}
        authClient={authClient}
      >
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const data = Route.useLoaderData();

  return (
    <html lang="fr" className={data.theme}>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        {children}
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

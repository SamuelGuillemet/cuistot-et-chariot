/// <reference types="vite/client" />

import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import type { ConvexQueryClient } from '@convex-dev/react-query';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools';
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { PropsWithChildren } from 'react';
import { Page404 } from '@/components/404';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth-client';
import {
  authSessionQueryOptions,
  themeQueryOptions,
} from '@/lib/server-queries';
import mainCss from '@/styles/main.css?url';

const ReactScan =
  process.env.NODE_ENV === 'production'
    ? () => null
    : () => (
        <script
          crossOrigin="anonymous"
          src="https://unpkg.com/react-scan/dist/auto.global.js"
        />
      );

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
  breadcrumbs?: string;
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
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  beforeLoad: async (opts) => {
    const { token } = await opts.context.queryClient.ensureQueryData(
      authSessionQueryOptions(),
    );
    if (token) {
      opts.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { isAuthenticated: !!token, token };
  },
  loader: async (opts) => {
    await opts.context.queryClient.ensureQueryData(themeQueryOptions());
    return {
      breadcrumbs: null,
    };
  },
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });

  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const { data: theme } = useSuspenseQuery(themeQueryOptions());

  return (
    <html lang="fr" className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
        <ReactScan />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <ThemeProvider theme={theme}>
          {children}
          <Toaster richColors position="bottom-left" />
        </ThemeProvider>
        <TanStackDevtools
          plugins={[
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'TanStack Form',
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

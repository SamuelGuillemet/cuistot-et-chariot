/// <reference types="vite/client" />

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
import type { PropsWithChildren } from 'react';
import { Page404 } from '@/components/404';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { setupSSR } from '@/server/auth';
import { getThemeServerFn } from '@/server/theme';
import mainCss from '@/styles/main.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
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
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  beforeLoad: async (ctx) => setupSSR(ctx.context),
  loader: async () => ({
    breadcrumbs: null,
    theme: await getThemeServerFn(),
  }),
  gcTime: 1000 * 60 * 5, // 5 minutes
  staleTime: 1000 * 60 * 1, // 1 minute
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const data = Route.useLoaderData();

  return (
    <html lang="fr" className={data.theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <ThemeProvider theme={data.theme}>
          {children}
          <Toaster richColors />
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

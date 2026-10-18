import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import type { ConvexQueryClient } from '@convex-dev/react-query';
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { Page404 } from '@/components/404';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth-client';
import { authSessionQueryOptions, themeQueryOptions } from '@/lib/server-queries';
import mainCss from '@/styles/main.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  beforeLoad: async (opts) => {
    if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true') {
      return { isAuthenticated: true, token: undefined };
    }

    const { token } = await opts.context.queryClient.query({
      ...authSessionQueryOptions(),
      staleTime: 'static',
    });
    if (token) {
      opts.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { isAuthenticated: !!token, token };
  },
  loader: async (opts) => {
    await opts.context.queryClient.query({ ...themeQueryOptions(), staleTime: 'static' });
  },
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
        name: 'theme-color',
        content: '#171717',
      },
      {
        title: 'Cuistot et Chariot',
      },
    ],
    links: [
      { rel: 'stylesheet', href: mainCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
    ],
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(document.documentElement.classList.contains('system')&&matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')",
          }}
        />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <ThemeProvider theme={theme}>
          {children}
          <Toaster
            richColors
            position="top-center"
            offset={{ top: 64 }}
            mobileOffset={{ top: 64, left: 16, right: 16 }}
          />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

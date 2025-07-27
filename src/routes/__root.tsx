/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Page404 } from '@/components/404';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { getThemeServerFn } from '@/components/server/theme';
import mainCss from '@/styles/main.css?url';
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
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
    ],
    links: [{ rel: 'stylesheet', href: mainCss }],
  }),
  component: RootComponent,
  notFoundComponent: Page404,
  loader: async () => ({
    theme: await getThemeServerFn(),
    breadcrumbs: 'Home',
  }),
});

function RootComponent() {
  const data = Route.useLoaderData();
  return (
    <ThemeProvider theme={data.theme}>
      <RootDocument />
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

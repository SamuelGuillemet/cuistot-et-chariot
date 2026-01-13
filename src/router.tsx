import { ConvexQueryClient } from '@convex-dev/react-query';
import {
  MutationCache,
  notifyManager,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Page404 } from './components/404';
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(globalThis.requestAnimationFrame);
  }

  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) {
    throw new Error('Missing required environment variable: VITE_CONVEX_URL');
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
    verbose: true,
    expectAuth: true,
  });

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ConvexError) {
          toast(error.data);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ConvexError) {
          toast.error(error.data);
        }
      },
    }),
  });
  convexQueryClient.connect(queryClient);

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    scrollRestorationBehavior: 'smooth',
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: Page404,
    context: { queryClient, convexQueryClient },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

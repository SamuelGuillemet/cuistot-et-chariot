import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Layout } from '@/components/layout';
import { UnsavedChangesProvider } from '@/hooks/use-unsaved-changes-context';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  loader: async ({ context }) => {
    await context.convexQueryClient.queryClient.query({
      ...convexQuery(api.users.viewer, {}),
      staleTime: 'static',
    });
  },
  component: () => (
    <Layout>
      <UnsavedChangesProvider>
        <Outlet />
      </UnsavedChangesProvider>
    </Layout>
  ),
});

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Authenticated, AuthLoading } from 'convex/react';
import { Loader2Icon } from 'lucide-react';
import { Layout } from '@/components/layout';
import { getHouseholdIdServerFn } from '@/server/misc';
import { getSideBarStateServerFn } from '@/server/sidebar';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.userId) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  loader: async () => {
    return {
      breadcrumbs: 'Dashboard',
      pathname: '/dashboard',
      sidebar: await getSideBarStateServerFn(),
      householdId: await getHouseholdIdServerFn(),
    };
  },
  component: () => (
    <>
      <Authenticated>
        <Layout>
          <Outlet />
        </Layout>
      </Authenticated>
      <AuthLoading>
        <div className="flex justify-center items-center w-screen h-screen">
          <Loader2Icon className="animate-spin" />
        </div>
      </AuthLoading>
    </>
  ),
});

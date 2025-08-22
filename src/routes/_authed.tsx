import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Layout } from '@/components/layout';
import { getHouseholdIdServerFn } from '@/server/misc';
import { getSideBarStateServerFn } from '@/server/sidebar';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.userId) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  loader: async (opts) => {
    const householdId = await getHouseholdIdServerFn();

    await Promise.all([
      opts.context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.users.viewer, {}),
      ),
      opts.context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getOwnHouseholds, {}),
      ),
      householdId &&
        opts.context.convexQueryClient.queryClient.ensureQueryData(
          convexQuery(api.households_members.queries.getCurrentUserMember, {
            publicId: householdId,
          }),
        ),
    ]);
    return {
      breadcrumbs: 'Dashboard',
      pathname: '/dashboard',
      sidebar: await getSideBarStateServerFn(),
      householdId: householdId,
    };
  },
  gcTime: 1000 * 60 * 5, // 5 minutes
  staleTime: 1000 * 60 * 1, // 1 minute
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {/* <Authenticated>
      </Authenticated>
      <AuthLoading>
        <div className="flex justify-center items-center w-screen h-screen">
          <Loader2Icon className="animate-spin" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex justify-center items-center w-screen h-screen">
          <p className="text-lg">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </Unauthenticated> */}
    </>
  ),
});

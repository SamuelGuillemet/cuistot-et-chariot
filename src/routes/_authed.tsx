import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Layout } from '@/components/layout';
import { UnsavedChangesProvider } from '@/hooks/use-unsaved-changes-context';
import {
  householdIdQueryOptions,
  setHouseholdIdServerFn,
  sidebarStateQueryOptions,
} from '@/lib/server-queries';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }

    // Setup householdId
    const [householdId, ownHouseholds] = await Promise.all([
      context.queryClient.ensureQueryData(householdIdQueryOptions()),
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getOwnHouseholds, {}),
      ),
    ]);

    const ownHousehold = ownHouseholds.find(
      (h) => h.household.publicId === householdId,
    );

    if (!ownHousehold && householdId !== null) {
      context.queryClient.setQueryData(
        householdIdQueryOptions().queryKey,
        null,
      );
      await setHouseholdIdServerFn({ data: null });
    }
    return {
      householdId: ownHousehold ? householdId : null,
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(householdIdQueryOptions()),
      context.queryClient.ensureQueryData(sidebarStateQueryOptions()),
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getOwnHouseholds, {}),
      ),
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.users.viewer, {}),
      ),
      context.householdId &&
        context.convexQueryClient.queryClient.ensureQueryData(
          convexQuery(api.households_members.queries.getCurrentUserMember, {
            publicId: context.householdId,
          }),
        ),
    ]);

    return {
      breadcrumbs: 'Dashboard',
      pathname: '/dashboard',
    };
  },
  component: () => (
    <Layout>
      <UnsavedChangesProvider>
        <Outlet />
      </UnsavedChangesProvider>
    </Layout>
  ),
});

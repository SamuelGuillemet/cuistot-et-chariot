import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/recipes')({
  beforeLoad: async ({ context }) => {
    const householdId = context.householdId;
    if (!householdId) {
      throw redirect({ to: '/dashboard' });
    }

    return { householdId };
  },
  loader: async ({ context }) => {
    return {
      breadcrumbs: 'Recettes',
      householdId: context.householdId,
    };
  },
  component: Outlet,
});

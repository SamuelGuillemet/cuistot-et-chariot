import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.userId) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  component: () => (
    <Authenticated>
      <Outlet />
    </Authenticated>
  ),
});

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authed/"!</div>;
}

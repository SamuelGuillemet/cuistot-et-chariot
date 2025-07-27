import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test')({
  component: RouteComponent,
  loader: async () => {
    return { breadcrumbs: 'Test' };
  },
});

function RouteComponent() {
  return <div>Hello "/test"!</div>;
}

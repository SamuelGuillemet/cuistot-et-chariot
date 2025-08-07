import { createFileRoute } from '@tanstack/react-router';
import { TestTube2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400">
        This is the root route of your application.
      </p>
      <Button>
        <TestTube2Icon></TestTube2Icon>
        Click me
      </Button>
    </div>
  );
}

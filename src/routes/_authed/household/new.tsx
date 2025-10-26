import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { HouseholdForm } from '@/components/households/household-form';
import { useHouseholdMutationOptions } from '@/lib/server-queries';

export const Route = createFileRoute('/_authed/household/new')({
  component: RouteComponent,
  loader: () => {
    return {
      breadcrumbs: 'Ajouter un foyer',
    };
  },
});

function RouteComponent() {
  const router = useRouter();

  const householdMutation = useMutation(useHouseholdMutationOptions());

  const mutationFn = useConvexMutation(
    api.households.mutations.createHousehold,
  );
  const { mutate, isPending } = useMutation({
    mutationFn,
    onError: (error) => {
      console.error('Error creating household:', error);
      toast.error('Impossible de créer le foyer');
    },
    onSuccess: async (data) => {
      toast.success('Foyer créé avec succès');
      await householdMutation.mutateAsync(data.publicId);
      router.navigate({
        to: '/household',
      });
    },
  });

  return (
    <div className="flex justify-center w-full grow">
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-4xl">
        <h1 className="font-semibold text-2xl tracking-tight">
          Créer un foyer
        </h1>
        <HouseholdForm
          onSubmit={mutate}
          isPending={isPending}
          readOnly={false}
        />
      </div>
    </div>
  );
}

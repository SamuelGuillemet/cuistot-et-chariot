import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';
import z from 'zod';
import { HouseholdDeleteButton } from '@/components/households/household-delete-button';
import {
  HouseholdForm,
  type HouseholdFormValues,
} from '@/components/households/household-form';

const householdId = z.object({
  id: z.guid(),
});

export const Route = createFileRoute('/_authed/household/$id')({
  component: RouteComponent,
  params: {
    parse: householdId.parse,
  },
  loader: async (opts) => {
    try {
      await opts.context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.getHousehold, { publicId: opts.params.id }),
      );
    } catch (_) {
      throw redirect({
        to: '/dashboard',
      });
    }

    return {
      breadcrumbs: 'Modifier un foyer',
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(
    convexQuery(api.households.getHousehold, { publicId: id }),
  );

  const mutationFn = useConvexMutation(api.households.updateHousehold);
  const { mutate, isPending } = useMutation({
    mutationFn,
    onError: (error) => {
      console.error('Error creating household:', error);
      toast.error('Impossible de mettre à jour le foyer');
    },
    onSuccess: () => {
      toast.success('Foyer mis à jour avec succès');
    },
  });

  const onSubmit = (submitData: HouseholdFormValues) => {
    mutate({
      ...submitData,
      publicId: id,
    });
  };

  return (
    <div className="flex justify-center w-full grow">
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-4xl">
        <div className="flex justify-between items-center gap-4">
          <h1 className="font-semibold text-2xl tracking-tight">
            Modifier le foyer
          </h1>
          <HouseholdDeleteButton householdId={id} />
        </div>
        <HouseholdForm
          onSubmit={onSubmit}
          isPending={isPending}
          values={data}
        />
      </div>
    </div>
  );
}

import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';
import { HouseholdDeleteButton } from '@/components/households/household-delete-button';
import {
  HouseholdForm,
  type HouseholdFormValues,
} from '@/components/households/household-form';
import { HouseholdMembersCard } from '@/components/households/household-members-card';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/_authed/household/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const householdId = context.householdId;
    if (!householdId) {
      throw redirect({ to: '/dashboard' });
    }

    return { householdId };
  },
  loader: async ({ context }) => {
    const householdId = context.householdId;
    await Promise.all([
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households.queries.getHousehold, {
          publicId: householdId,
        }),
      ),
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households_members.queries.getHouseholdMembers, {
          publicId: householdId,
        }),
      ),
      context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.households_members.queries.getCurrentUserMember, {
          publicId: householdId,
        }),
      ),
    ]);

    return {
      breadcrumbs: 'Modifier un foyer',
      householdId,
    };
  },
});

function RouteComponent() {
  const { householdId } = Route.useLoaderData();
  const { data } = useSuspenseQuery(
    convexQuery(api.households.queries.getHousehold, { publicId: householdId }),
  );

  const { currentMember } = useCurrentMember();

  const mutationFn = useConvexMutation(
    api.households.mutations.updateHousehold,
  );
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
      publicId: householdId,
    });
  };

  return (
    <div className="flex justify-center w-full grow">
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-4xl">
        <div className="flex justify-between items-center gap-4">
          <h1 className="font-semibold text-2xl tracking-tight">
            Modifier mon foyer
          </h1>
          <HouseholdDeleteButton
            householdId={householdId}
            hidden={!currentMember.canEditHousehold}
          />
        </div>
        <div className="flex flex-col gap-6">
          <HouseholdForm
            onSubmit={onSubmit}
            isPending={isPending}
            values={data}
            readOnly={!currentMember.canEditHousehold}
          />
          <HouseholdMembersCard householdPublicId={householdId} />
        </div>
      </div>
    </div>
  );
}

import { convexQuery } from '@convex-dev/react-query';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { householdIdQueryOptions } from '@/lib/server-queries';

type CurrentMember = NonNullable<
  FunctionReturnType<typeof api.households_members.queries.getCurrentUserMember>
>;

const defaultCurrentMember: CurrentMember = {
  _id: '' as Id<'householdMembers'>,
  _creationTime: Date.now(),
  userId: '' as Id<'users'>,
  householdId: '' as Id<'households'>,
  role: 'member',
  status: 'pending',
  canEditHousehold: false,
  canManageProducts: false,
};

export function useCurrentMember(): {
  currentMember: CurrentMember;
  householdPublicId: string | null;
} {
  const { data: householdId } = useSuspenseQuery(householdIdQueryOptions());

  const { data: currentMember } = useQuery({
    ...convexQuery(
      api.households_members.queries.getCurrentUserMember,
      householdId ? { publicId: householdId } : 'skip',
    ),
    enabled: !!householdId,
  });

  return {
    currentMember: currentMember || defaultCurrentMember,
    householdPublicId: householdId,
  };
}

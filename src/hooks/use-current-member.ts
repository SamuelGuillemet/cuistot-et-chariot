import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { useHousehold } from '@/stores/household';

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
};

export function useCurrentMember(householdPublicId?: string): {
  currentMember: CurrentMember;
} {
  const householdId = useHousehold.use.householdId();

  const usePublicId = householdPublicId ?? householdId;

  const { data: currentMember } = useQuery({
    ...convexQuery(
      api.households_members.queries.getCurrentUserMember,
      usePublicId ? { publicId: usePublicId } : 'skip',
    ),
    enabled: !!usePublicId,
  });

  return { currentMember: currentMember || defaultCurrentMember };
}

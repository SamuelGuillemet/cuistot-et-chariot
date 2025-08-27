import type { api } from 'convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';

export type BadgeVariant = {
  icon?: React.ElementType;
  text: string;
  variant: 'default' | 'outline' | 'destructive';
  className?: string;
};

export type HouseholdMember = FunctionReturnType<
  typeof api.households_members.queries.getHouseholdMembers
>[number];

export type MemberActionsProps = {
  member: HouseholdMember;
  householdPublicId: string;
};

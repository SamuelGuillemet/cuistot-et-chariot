import { asyncMap, nullThrows } from 'convex-helpers';
import { queryWithRLS } from './rls';

export const getHouseholdMembers = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const { household } = ctx;

    const householdMembers = await ctx.db
      .query('householdMembers')
      .withIndex('by_householdId', (q) => q.eq('householdId', household._id))
      .collect();

    return await asyncMap(householdMembers, async (member) => ({
      _id: member._id,
      role: member.role,
      status: member.status,
      canEditHousehold: member.canEditHousehold,
      householdId: member.householdId,
      user: nullThrows(await ctx.db.get(member.userId)),
    }));
  },
});

export const getCurrentUserMember = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const { household } = ctx;

    const currentUserMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', ctx.userId).eq('householdId', household._id),
      )
      .first();

    return currentUserMember;
  },
});

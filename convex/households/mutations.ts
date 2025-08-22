import { v } from 'convex/values';
import { nullThrows } from 'convex-helpers';
import { v4 as uuid } from 'uuid';
import { withoutSystemFields } from '@/utils/convex';
import { mutationWithRLS } from './rls';

export const createHousehold = mutationWithRLS({
  args: {
    name: v.string(),
    joinQuestion: v.string(),
    joinAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    const householdId = await ctx.db.insert('households', {
      ...args,
      publicId: uuid(),
    });
    await ctx.db.insert('householdMembers', {
      userId: ctx.userId,
      householdId: householdId,
      role: 'admin',
      canEditHousehold: true,
      status: 'accepted',
    });

    return withoutSystemFields(nullThrows(await ctx.db.get(householdId)));
  },
});

export const updateHousehold = mutationWithRLS({
  args: {
    publicId: v.string(),
    name: v.string(),
    joinQuestion: v.string(),
    joinAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query('households')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .first();

    if (!household) throw new Error('Household not found');

    await ctx.db.patch(household._id, {
      ...args,
    });
    return withoutSystemFields(nullThrows(await ctx.db.get(household._id)));
  },
});

export const deleteHousehold = mutationWithRLS({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query('households')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .first();

    if (!household) throw new Error('Household not found');

    const householdMembers = await ctx.db
      .query('householdMembers')
      .withIndex('by_householdId', (q) => q.eq('householdId', household._id))
      .collect();

    await ctx.db.delete(household._id);
    await Promise.all(
      householdMembers.map((member) => ctx.db.delete(member._id)),
    );
  },
});

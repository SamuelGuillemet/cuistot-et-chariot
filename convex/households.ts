import { v } from 'convex/values';
import { asyncMap, nullThrows } from 'convex-helpers';
import { getManyFrom } from 'convex-helpers/server/relationships';
import { v4 as uuid } from 'uuid';
import { withoutSystemFields } from '@/utils/convex';
import { getAuthUserId } from './helpers';
import { mutationWithRLS, queryWithRLS } from './rls';

export const getOwnHouseholds = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const householdMembers = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    return asyncMap(householdMembers, async (member) => ({
      household: nullThrows(await ctx.db.get(member.householdId)),
      role: member.role,
    }));
  },
});

export const getHouseholdDetails = queryWithRLS({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const household = nullThrows(
      await ctx.db
        .query('households')
        .withIndex('by_publicId', (q) => q.eq('publicId', args.id))
        .first(),
    );

    return withoutSystemFields({
      ...household,
      members: await asyncMap(
        await getManyFrom(
          ctx.db,
          'householdMembers',
          'by_householdId',
          household._id,
        ),
        async (member) => ({
          user: nullThrows(await ctx.db.get(member.userId)),
          role: member.role,
        }),
      ),
    });
  },
});

export const existsByName = queryWithRLS({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query('households')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    return !!household;
  },
});

export const getHousehold = queryWithRLS({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query('households')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .first();

    return withoutSystemFields(nullThrows(household));
  },
});

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

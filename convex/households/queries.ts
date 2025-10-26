import { ConvexError, v } from 'convex/values';
import { asyncMap, nullThrows } from 'convex-helpers';
import { query } from '../_generated/server';
import { getAuthUserId } from '../auth';
import { withoutSystemFields } from '../utils';
import { queryWithRLS } from './rls';

export const getJoinHousehold = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query('households')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .first();

    if (!household) {
      throw new ConvexError('Household not found');
    }

    return {
      joinQuestion: household.joinQuestion,
      name: household.name,
    };
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

export const getOwnHouseholds = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const householdMembers = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    const result = await asyncMap(householdMembers, async (member) => {
      const household = await ctx.db.get(member.householdId);
      if (!household) return null;
      return {
        household,
        role: member.role,
      };
    });

    return result.filter((item) => item !== null);
  },
});

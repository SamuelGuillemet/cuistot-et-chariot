import { v } from 'convex/values';
import {
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import {
  type Rules,
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from 'convex-helpers/server/rowLevelSecurity';
import type { DataModel, Id } from '../_generated/dataModel';
import { mutation, type QueryCtx, query } from '../_generated/server';
import { validateUserAndHousehold } from '../auth';

async function rlsRules(ctx: QueryCtx, userId: Id<'users'>) {
  return {
    mealPlans: {
      insert: async (_, mealPlan) => {
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', mealPlan.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      read: async (_, mealPlan) => {
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', mealPlan.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      modify: async (_, mealPlan) => {
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', mealPlan.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
    },
  } satisfies Rules<QueryCtx, DataModel>;
}

export const queryWithRLS = customQuery(query, {
  args: {
    publicId: v.string(),
  },
  input: async (ctx, args) => {
    const { userId, householdId } = await validateUserAndHousehold(ctx, args);
    return {
      ctx: {
        userId,
        householdId,
        db: wrapDatabaseReader(ctx, ctx.db, await rlsRules(ctx, userId)),
      },
      args: {},
    };
  },
});

export const mutationWithRLS = customMutation(mutation, {
  args: {
    publicId: v.string(),
  },
  input: async (ctx, args) => {
    const { userId, householdId } = await validateUserAndHousehold(ctx, args);
    return {
      ctx: {
        userId,
        householdId,
        db: wrapDatabaseWriter(ctx, ctx.db, await rlsRules(ctx, userId)),
      },
      args: {},
    };
  },
});

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
import { validateUserAndHousehold } from '../helpers';

async function rlsRules(ctx: QueryCtx, userId: Id<'users'>) {
  return {
    products: {
      insert: async (_, product) => {
        // Check that the user is a member of the household and has canManageProducts permission
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', product.householdId),
          )
          .first();
        return member?.canManageProducts ?? false;
      },
      read: async (_, product) => {
        // Check that the user is a member of the same household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', product.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      modify: async (_, product) => {
        // Check that the user is a member of the household and has canManageProducts permission
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', product.householdId),
          )
          .first();
        return member?.canManageProducts ?? false;
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

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
    recipes: {
      insert: async (_, recipe) => {
        // Check that the user is a member of the household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipe.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      read: async (_, recipe) => {
        // Check that the user is a member of the same household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipe.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      modify: async (_, recipe) => {
        // Check that the user is a member of the household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipe.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
    },
    recipeProducts: {
      insert: async (_, recipeProduct) => {
        // Check that the user is a member of the household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipeProduct.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      read: async (_, recipeProduct) => {
        // Check that the user is a member of the same household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipeProduct.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
      modify: async (_, recipeProduct) => {
        // Check that the user is a member of the household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', recipeProduct.householdId),
          )
          .first();
        return member?.status === 'accepted';
      },
    },
    recipeFavorites: {
      insert: async (_, favorite) => {
        // Only the user themselves can add to their favorites
        return favorite.userId === userId;
      },
      read: async (_, favorite) => {
        // Users can only read their own favorites
        return favorite.userId === userId;
      },
      modify: async (_, favorite) => {
        // Only the user themselves can remove from their favorites
        return favorite.userId === userId;
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

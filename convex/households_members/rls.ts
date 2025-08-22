import { ConvexError, v } from 'convex/values';
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
import { getAuthUserId } from '../helpers';

async function preCheck(ctx: QueryCtx, args: { publicId: string }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError('Unauthorized');
  }
  const household = await ctx.db
    .query('households')
    .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
    .first();
  if (!household) {
    throw new ConvexError('Household not found');
  }
  return { userId, household };
}

async function rlsRules(ctx: QueryCtx, userId: Id<'users'>) {
  return {
    householdMembers: {
      insert: async () => {
        return true;
      },
      read: async (_, household_member) => {
        // Check that the user is a member of the same household
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q
              .eq('userId', userId)
              .eq('householdId', household_member.householdId),
          )
          .first();
        return member !== null;
      },
      modify: async (_, household_member) => {
        const member = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q
              .eq('userId', userId)
              .eq('householdId', household_member.householdId),
          )
          .first();
        return member !== null;
      },
    },
  } satisfies Rules<QueryCtx, DataModel>;
}

export const queryWithRLS = customQuery(query, {
  args: {
    publicId: v.string(),
  },
  input: async (ctx, args) => {
    const { userId, household } = await preCheck(ctx, args);
    return {
      ctx: {
        userId,
        household,
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
    const { userId, household } = await preCheck(ctx, args);
    return {
      ctx: {
        userId,
        household,
        db: wrapDatabaseWriter(ctx, ctx.db, await rlsRules(ctx, userId)),
      },
      args: {},
    };
  },
});

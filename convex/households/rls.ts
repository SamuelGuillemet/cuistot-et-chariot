import { ConvexError } from 'convex/values';
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

async function rlsRules(ctx: QueryCtx, userId: Id<'users'>) {
  return {
    households: {
      insert: async () => {
        return true;
      },
      read: async (_, household) => {
        const householdMember = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', household._id),
          )
          .first();
        return householdMember?.status === 'accepted';
      },
      modify: async (_, household) => {
        const householdMember = await ctx.db
          .query('householdMembers')
          .withIndex('by_userId_householdId', (q) =>
            q.eq('userId', userId).eq('householdId', household._id),
          )
          .first();
        return (
          householdMember?.status === 'accepted' &&
          (householdMember?.canEditHousehold ?? false)
        );
      },
    },
  } satisfies Rules<QueryCtx, DataModel>;
}

export const queryWithRLS = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('Unauthorized');
    }
    return {
      ctx: {
        userId,
        db: wrapDatabaseReader(ctx, ctx.db, await rlsRules(ctx, userId)),
      },
      args: {},
    };
  },
});

export const mutationWithRLS = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('Unauthorized');
    }
    return {
      ctx: {
        userId,
        db: wrapDatabaseWriter(ctx, ctx.db, await rlsRules(ctx, userId)),
      },
      args: {},
    };
  },
});

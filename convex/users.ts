import { nullThrows } from 'convex-helpers';
import { ConvexError } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId, isAuthDisabledForTesting, TEST_AUTH_ID } from './auth';

export const ensureTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    if (!isAuthDisabledForTesting()) {
      throw new ConvexError('Test authentication is disabled');
    }

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_authId', (q) => q.eq('authId', TEST_AUTH_ID))
      .unique();
    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert('users', {
      authId: TEST_AUTH_ID,
      name: 'Test User',
      email: 'test@example.com',
    });
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('User not authenticated');
    }
    return nullThrows(await ctx.db.get(userId));
  },
});

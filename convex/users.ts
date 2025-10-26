import { ConvexError } from 'convex/values';
import { nullThrows } from 'convex-helpers';
import { query } from './_generated/server';
import { getAuthUserId } from './auth';

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

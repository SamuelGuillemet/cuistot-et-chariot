import { query } from '../_generated/server';
import { requireAuthUserId } from '../auth';

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthUserId(ctx);

    return await ctx.db.query('products').withIndex('by_name').order('asc').collect();
  },
});

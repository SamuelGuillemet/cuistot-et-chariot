import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) {
      return null;
    }
    const userId = auth.subject as Id<"users">;
    return ctx.db.get(userId);
  },
});

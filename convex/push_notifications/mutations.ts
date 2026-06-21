import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation } from '../_generated/server';
import { getAuthUserId } from '../auth';

// Sauvegarde (ou met à jour) une subscription push pour l'utilisateur connecté
export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    expirationTime: v.optional(v.number()),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, true);
    if (!userId) throw new ConvexError('Not authenticated');

    const existing = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, userId });
    } else {
      await ctx.db.insert('pushSubscriptions', { userId, ...args });
    }
  },
});

// Supprime la subscription push de l'utilisateur connecté
export const deleteSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, true);
    if (!userId) throw new ConvexError('Not authenticated');

    const sub = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first();

    if (sub && sub.userId === userId) {
      await ctx.db.delete(sub._id);
    }
  },
});

// Utilisé par l'action Node pour nettoyer les subscriptions expirées (HTTP 410)
export const deleteExpiredSubscription = internalMutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first();

    if (sub) {
      await ctx.db.delete(sub._id);
    }
  },
});

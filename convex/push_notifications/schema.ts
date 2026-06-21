import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';

export const pushSubscriptionsSchema = defineTable({
  userId: v.id('users'),
  endpoint: v.string(),
  expirationTime: v.optional(v.number()),
  // Clés cryptographiques de la PushSubscription du navigateur
  p256dh: v.string(),
  auth: v.string(),
})
  .index('by_userId', ['userId'])
  .index('by_endpoint', ['endpoint']);

export type PushSubscriptionDoc = Doc<'pushSubscriptions'>;

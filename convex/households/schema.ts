import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const householdsSchema = defineTable({
  name: v.string(),
  publicId: v.string(),
  joinQuestion: v.string(),
  joinAnswer: v.string(),
})
  .index('by_name', ['name'])
  .index('by_publicId', ['publicId']);

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { makeEnum } from './helpers';
import type { Role } from './types';

const rolesEnum = makeEnum<Role>(['admin', 'member']);

const usersSchema = defineTable({
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
});

const householdsSchema = defineTable({
  name: v.string(),
  publicId: v.string(),
  joinQuestion: v.string(),
  joinAnswer: v.string(),
})
  .index('by_name', ['name'])
  .index('by_publicId', ['publicId']);

const householdMembersSchema = defineTable({
  householdId: v.id('households'),
  userId: v.id('users'),

  role: rolesEnum,

  // Permissions
  canEditHousehold: v.boolean(),
})
  .index('by_userId', ['userId'])
  .index('by_householdId', ['householdId'])
  .index('by_userId_householdId', ['userId', 'householdId']);

export default defineSchema({
  users: usersSchema,

  households: householdsSchema,

  householdMembers: householdMembersSchema,
});

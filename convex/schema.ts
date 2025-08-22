import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { householdsSchema } from './households/schema';
import { householdMembersSchema } from './households_members/schema';

const usersSchema = defineTable({
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
});

export default defineSchema({
  users: usersSchema,
  households: householdsSchema,
  householdMembers: householdMembersSchema,
});

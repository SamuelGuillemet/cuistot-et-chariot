import { makeEnum } from 'convex/helpers';
import { defineTable } from 'convex/server';
import type { Role, Status } from 'convex/types';
import { v } from 'convex/values';

const rolesEnum = makeEnum<Role>(['admin', 'member']);

const statusEnum = makeEnum<Status>(['pending', 'accepted', 'banned']);

export const householdMembersSchema = defineTable({
  householdId: v.id('households'),
  userId: v.id('users'),

  role: rolesEnum,

  status: statusEnum,

  // Permissions
  canEditHousehold: v.boolean(),
})
  .index('by_userId', ['userId'])
  .index('by_householdId', ['householdId'])
  .index('by_userId_householdId', ['userId', 'householdId']);

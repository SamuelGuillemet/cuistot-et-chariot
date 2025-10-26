import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { createPatchBuilder, makeEnum } from '../helpers';
import type { Role, Status } from '../types';

const rolesEnum = makeEnum<Role>(['admin', 'member']);

const statusEnum = makeEnum<Status>(['pending', 'accepted', 'banned']);

export const householdMembersSchema = defineTable({
  householdId: v.id('households'),
  userId: v.id('users'),

  role: rolesEnum,

  status: statusEnum,

  // Permissions
  canEditHousehold: v.boolean(),
  canManageProducts: v.boolean(),
})
  .index('by_userId', ['userId'])
  .index('by_householdId', ['householdId'])
  .index('by_userId_householdId', ['userId', 'householdId']);

export const householdMembersPatchBuilder =
  createPatchBuilder<Doc<'householdMembers'>>();

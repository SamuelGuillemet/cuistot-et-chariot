import { ConvexError, v } from 'convex/values';
import { mutationWithRLS } from './rls';
import { householdMembersPatchBuilder } from './schema';

export const joinHousehold = mutationWithRLS({
  args: {
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const { household } = ctx;

    const userId = ctx.userId;
    const existingMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', userId).eq('householdId', household._id),
      )
      .first();

    if (existingMember) {
      throw new ConvexError('User is already a member of this household');
    }

    // Check that the user answered the question correctly
    if (household.joinAnswer !== args.answer) {
      throw new ConvexError('Incorrect answer to join question');
    }

    await ctx.db.insert('householdMembers', {
      householdId: household._id,
      userId,
      canEditHousehold: false,
      canManageProducts: false, // Default to false for new members
      role: 'member',
      status: 'pending',
    });
  },
});

export const updateMemberRole = mutationWithRLS({
  args: {
    memberId: v.id('householdMembers'),
    role: v.union(v.literal('admin'), v.literal('member')),
  },
  handler: async (ctx, args) => {
    const { household } = ctx;

    // Check if the current user is an admin
    const currentUserMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', ctx.userId).eq('householdId', household._id),
      )
      .first();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new ConvexError('Only admins can change member roles');
    }

    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.householdId !== household._id) {
      throw new ConvexError('Member not found in this household');
    }

    // Prevent removing the last admin
    if (memberToUpdate.role === 'admin') {
      const adminCount = await ctx.db
        .query('householdMembers')
        .withIndex('by_householdId', (q) => q.eq('householdId', household._id))
        .filter((q) => q.eq(q.field('role'), 'admin'))
        .collect();

      if (adminCount.length <= 1) {
        throw new ConvexError('Cannot remove the last admin');
      }
    }

    await ctx.db.patch(args.memberId, {
      role: args.role,
      canEditHousehold: args.role === 'admin',
    });
  },
});

export const updateMemberStatus = mutationWithRLS({
  args: {
    memberId: v.id('householdMembers'),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('banned'),
    ),
  },
  handler: async (ctx, args) => {
    const { household } = ctx;

    // Check if the current user is an admin
    const currentUserMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', ctx.userId).eq('householdId', household._id),
      )
      .first();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new ConvexError('Only admins can change member status');
    }

    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.householdId !== household._id) {
      throw new ConvexError('Member not found in this household');
    }

    await ctx.db.patch(args.memberId, {
      status: args.status,
    });
  },
});

export const updateMemberPermissions = mutationWithRLS({
  args: {
    memberId: v.id('householdMembers'),
    canEditHousehold: v.optional(v.boolean()),
    canManageProducts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { household } = ctx;

    // Check if the current user is an admin
    const currentUserMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', ctx.userId).eq('householdId', household._id),
      )
      .first();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new ConvexError('Only admins can update member permissions');
    }

    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.householdId !== household._id) {
      throw new ConvexError('Member not found in this household');
    }

    // Build the patch object with only provided permissions
    const patch = householdMembersPatchBuilder(args, ['memberId']);

    await ctx.db.patch(args.memberId, patch);
  },
});

export const removeMember = mutationWithRLS({
  args: {
    memberId: v.id('householdMembers'),
  },
  handler: async (ctx, args) => {
    const { household } = ctx;

    // Check if the current user is an admin
    const currentUserMember = await ctx.db
      .query('householdMembers')
      .withIndex('by_userId_householdId', (q) =>
        q.eq('userId', ctx.userId).eq('householdId', household._id),
      )
      .first();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new ConvexError('Only admins can remove members');
    }

    const memberToRemove = await ctx.db.get(args.memberId);
    if (!memberToRemove || memberToRemove.householdId !== household._id) {
      throw new ConvexError('Member not found in this household');
    }

    // Prevent removing the last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = await ctx.db
        .query('householdMembers')
        .withIndex('by_householdId', (q) => q.eq('householdId', household._id))
        .filter((q) =>
          q.and(
            q.eq(q.field('role'), 'admin'),
            q.eq(q.field('status'), 'accepted'),
          ),
        )
        .collect();

      if (adminCount.length <= 1) {
        throw new ConvexError('Cannot remove the last admin of the household');
      }
    }

    await ctx.db.delete(args.memberId);
  },
});

import {
  type AuthFunctions,
  BetterAuth,
  type PublicAuthFunctions,
} from '@convex-dev/better-auth';
import { ConvexError } from 'convex/values';
import { api, components, internal } from './_generated/api';
import type { DataModel, Id } from './_generated/dataModel';

const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (ctx, user) => {
    const authorized_emails =
      process.env.AUTHORIZED_EMAILS?.split(',')
        .map((email) => email.trim())
        .filter(Boolean) || [];
    if (!user.email || !authorized_emails.includes(user.email)) {
      // Reject the user if their email is not in the authorized list
      throw new ConvexError('Unauthorized email address');
    }

    return ctx.db.insert('users', {
      name: user.name,
      image: user.image ?? undefined,
      email: user.email,
    });
  },

  onDeleteUser: async (ctx, userId) => {
    await ctx.db.delete(userId as Id<'users'>);
  },
});

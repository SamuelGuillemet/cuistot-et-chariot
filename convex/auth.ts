import {
  type AuthFunctions,
  createClient,
  type GenericCtx,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { ConvexError } from 'convex/values';
import { components, internal } from './_generated/api';
import type { DataModel, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import authConfig from './auth.config';

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        const authorized_emails =
          process.env.AUTHORIZED_EMAILS?.split(',')
            .map((email) => email.trim())
            .filter(Boolean) || [];
        if (!authUser.email || !authorized_emails.includes(authUser.email)) {
          // Reject the user if their email is not in the authorized list
          throw new ConvexError('Unauthorized email address');
        }

        await ctx.db.insert('users', {
          name: authUser.name,
          image: authUser.image ?? undefined,
          email: authUser.email,
          authId: authUser._id,
        });
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_authId', (q) => q.eq('authId', authUser._id))
          .unique();
        if (!user) {
          throw new ConvexError('User not found');
        }
        await ctx.db.delete(user._id);
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    rateLimit: {
      enabled: false,
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
  shouldThrow: boolean = false,
): Promise<Id<'users'> | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    if (shouldThrow) {
      throw new Error('User not authenticated');
    }
    return null;
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_authId', (q) => q.eq('authId', authUser._id))
    .unique();

  if (!user) {
    return null;
  }

  return user._id;
}

export async function validateUserAndHousehold(
  ctx: QueryCtx,
  args: { publicId: string },
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError('Unauthorized');
  }
  const household = await ctx.db
    .query('households')
    .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
    .first();
  if (!household) {
    throw new ConvexError('Household not found');
  }
  return { userId, householdId: household._id, household };
}

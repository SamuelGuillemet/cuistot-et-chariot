import { type AuthFunctions, createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { ConvexError } from 'convex/values';
import { components, internal } from './_generated/api';
import type { DataModel, Id } from './_generated/dataModel';
import { ActionCtx, env, type MutationCtx, type QueryCtx } from './_generated/server';
import authConfig from './auth.config';

const authFunctions: AuthFunctions = internal.auth;
const TEST_AUTH_ID = 'test-auth-user';

export const isAuthDisabledForTesting = () => {
  return env.DISABLE_AUTH_FOR_TESTING === 'true';
};

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        const authorized_emails =
          env.AUTHORIZED_EMAILS?.split(',')
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
    baseURL: env.SITE_URL,
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
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
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
  if (isAuthDisabledForTesting()) {
    const testUser = await ctx.db
      .query('users')
      .withIndex('by_authId', (q) => q.eq('authId', TEST_AUTH_ID))
      .unique();
    return testUser?._id ?? null;
  }

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

export async function requireAuthUserId(ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError('Unauthorized');
  }
  return userId;
}

export async function ensureActionAuth(ctx: ActionCtx): Promise<void> {
  if (isAuthDisabledForTesting()) {
    return;
  }
  if (!(await ctx.auth.getUserIdentity())) throw new ConvexError('Unauthorized');
}

export { TEST_AUTH_ID };

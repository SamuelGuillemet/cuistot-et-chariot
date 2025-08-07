import { convexAdapter } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import type { GenericActionCtx } from 'convex/server';
import { betterAuthComponent } from '../../convex/auth';

// biome-ignore lint/suspicious/noExplicitAny: We need to use `any` here to match the expected type in better-auth
export const createAuth = (ctx: GenericActionCtx<any>) =>
  betterAuth({
    baseURL: process.env.SITE_URL,
    database: convexAdapter(ctx, betterAuthComponent),
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
    plugins: [convex()],
  });

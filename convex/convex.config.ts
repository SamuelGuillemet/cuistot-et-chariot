import betterAuth from '@convex-dev/better-auth/convex.config';
import migrations from '@convex-dev/migrations/convex.config';
import { defineApp } from 'convex/server';
import { v } from 'convex/values';

const app = defineApp({
  env: {
    SITE_URL: v.string(),
    AUTHORIZED_EMAILS: v.string(),
    AUTH_GOOGLE_ID: v.string(),
    AUTH_GOOGLE_SECRET: v.string(),
    BETTER_AUTH_SECRET: v.string(),
    DISABLE_AUTH_FOR_TESTING: v.string(),
  },
});
app.use(betterAuth);
app.use(migrations);

export default app;

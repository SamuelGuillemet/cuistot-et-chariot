import { convexClient } from '@convex-dev/better-auth/client/plugins';
import type { AuthClient } from '@convex-dev/better-auth/react';
import { createAuthClient } from 'better-auth/react';

// @ts-expect-error: Auth client is wrongly typed
export const authClient: AuthClient = createAuthClient({
  plugins: [convexClient()],
});

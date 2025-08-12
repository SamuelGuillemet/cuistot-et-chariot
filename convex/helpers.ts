import type { Auth } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export function makeEnum<T extends string>(values: T[]) {
  return v.union(...values.map((value) => v.literal(value)));
}

interface Context {
  auth: Auth;
}

export async function getAuthUserId(
  ctx: Context,
  shouldThrow: boolean = false,
): Promise<Id<'users'> | null> {
  const auth = await ctx.auth.getUserIdentity();
  if (!auth) {
    if (shouldThrow) {
      throw new Error('User not authenticated');
    }
    return null;
  }
  return auth.subject as Id<'users'>;
}

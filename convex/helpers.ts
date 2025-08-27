import type { Auth } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import type { BetterOmit, Prettify } from '@/utils/types';
import type { Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';

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

export function buildPatchData<
  T extends Record<string, unknown>,
  K extends keyof T,
>(args: Partial<T>, excludeKeys: K[]): Prettify<Partial<BetterOmit<T, K>>> {
  const patchData: Partial<T> = {};
  for (const key in args) {
    if (args[key] !== undefined && !excludeKeys.includes(key as string as K)) {
      patchData[key] = args[key];
    }
  }
  return patchData;
}

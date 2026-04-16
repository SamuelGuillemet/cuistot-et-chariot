import { ConvexError, v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { mutationWithRLS } from './rls';
import { mealTypeEnum } from './schema';

export const upsertMealPlan = mutationWithRLS({
  args: {
    date: v.string(),
    mealType: mealTypeEnum,
    recipeId: v.string(),
    servings: v.number(),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe || recipe.householdId !== householdId) {
      throw new ConvexError('Recipe not found in this household');
    }

    const existing = await ctx.db
      .query('mealPlans')
      .withIndex('by_householdId_date_mealType', (q) =>
        q
          .eq('householdId', householdId)
          .eq('date', args.date)
          .eq('mealType', args.mealType),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        recipeId: args.recipeId as Id<'recipes'>,
        servings: args.servings,
      });
      return existing._id;
    }

    return await ctx.db.insert('mealPlans', {
      date: args.date,
      mealType: args.mealType,
      recipeId: args.recipeId as Id<'recipes'>,
      servings: args.servings,
      householdId,
    });
  },
});

export const deleteMealPlan = mutationWithRLS({
  args: {
    mealPlanId: v.string(),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const mealPlan = await ctx.db.get(args.mealPlanId as Id<'mealPlans'>);
    if (!mealPlan || mealPlan.householdId !== householdId) {
      throw new ConvexError('Meal plan not found');
    }

    await ctx.db.delete(args.mealPlanId as Id<'mealPlans'>);
  },
});

export const updateServings = mutationWithRLS({
  args: {
    mealPlanId: v.string(),
    servings: v.number(),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const mealPlan = await ctx.db.get(args.mealPlanId as Id<'mealPlans'>);
    if (!mealPlan || mealPlan.householdId !== householdId) {
      throw new ConvexError('Meal plan not found');
    }

    await ctx.db.patch(args.mealPlanId as Id<'mealPlans'>, {
      servings: args.servings,
    });
  },
});

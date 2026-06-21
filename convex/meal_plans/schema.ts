import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { createPatchBuilder, makeEnum } from '../helpers';
import { MEAL_TYPE_DISPLAY_NAMES, type MealType } from '../types';

export const mealTypeEnum = makeEnum<MealType>(
  Object.keys(MEAL_TYPE_DISPLAY_NAMES) as MealType[],
);

export const mealPlansSchema = defineTable({
  // ISO date string: YYYY-MM-DD
  date: v.string(),
  mealType: mealTypeEnum,
  recipeId: v.id('recipes'),
  servings: v.number(),
  householdId: v.id('households'),
})
  .index('by_householdId', ['householdId'])
  .index('by_householdId_date', ['householdId', 'date'])
  .index('by_householdId_date_mealType', ['householdId', 'date', 'mealType'])
  .index('by_recipeId', ['recipeId']);

export const mealPlansPatchBuilder = createPatchBuilder<Doc<'mealPlans'>>();

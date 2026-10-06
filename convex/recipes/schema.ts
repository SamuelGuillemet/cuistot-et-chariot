import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { createPatchBuilder, makeEnum } from '../helpers';
import { productUnitEnum } from '../products/schema';
import { RECIPE_DIFFICULTY_DISPLAY_NAMES, type RecipeDifficulty } from '../types';

export const recipeDifficultyEnum = makeEnum<RecipeDifficulty>(
  Object.keys(RECIPE_DIFFICULTY_DISPLAY_NAMES) as RecipeDifficulty[],
);

export const recipesSchema = defineTable({
  name: v.string(),
  // Store structured steps instead of a single string for better UX
  instructions: v.array(
    v.object({
      order: v.number(),
      text: v.string(),
    }),
  ),
  servings: v.number(),
  prepTime: v.number(),
  cookTime: v.number(),
  difficulty: recipeDifficultyEnum,
  householdId: v.optional(v.string()),
}).index('by_name', ['name']);

export const recipeProductsSchema = defineTable({
  recipeId: v.id('recipes'),
  productId: v.id('products'),
  quantity: v.number(),
  unit: productUnitEnum,
  householdId: v.optional(v.string()),
})
  .index('by_recipeId', ['recipeId'])
  .index('by_productId', ['productId']);

export const recipeFavoritesSchema = defineTable({
  recipeId: v.id('recipes'),
  userId: v.id('users'),
  householdId: v.optional(v.string()),
})
  .index('by_recipeId', ['recipeId'])
  .index('by_userId_recipeId', ['userId', 'recipeId']);

export const recipesPatchBuilder = createPatchBuilder<Doc<'recipes'>>();

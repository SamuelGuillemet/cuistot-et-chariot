import { v } from 'convex/values';
import { nullThrows } from 'convex-helpers';
import type { Id } from '../_generated/dataModel';
import { queryWithRLS } from './rls';

export const getRecipes = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const { householdId, userId } = ctx;

    const recipes = await ctx.db
      .query('recipes')
      .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
      .collect();

    // Enrich with favorite count for each recipe
    const recipesWithMeta = await Promise.all(
      recipes.map(async (recipe) => {
        const [favoriteResult, products] = await Promise.all([
          ctx.db
            .query('recipeFavorites')
            .withIndex('by_userId_recipeId', (q) =>
              q.eq('userId', userId).eq('recipeId', recipe._id),
            )
            .first(),
          ctx.db
            .query('recipeProducts')
            .withIndex('by_recipeId', (q) => q.eq('recipeId', recipe._id))
            .collect(),
        ]);

        const productsWithDetails = await Promise.all(
          products.map(async (p) => {
            const product = nullThrows(await ctx.db.get(p.productId));
            return {
              ...p,
              product,
            };
          }),
        );

        return {
          ...recipe,
          totalTime: recipe.prepTime + recipe.cookTime,
          isFavorite: !!favoriteResult,
          products: productsWithDetails,
        };
      }),
    );

    return recipesWithMeta;
  },
});

export const getRecipeById = queryWithRLS({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { householdId, userId } = ctx;

    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);

    if (recipe?.householdId !== householdId) {
      return null;
    }

    // Get favorite status for the current user
    const favorite = await ctx.db
      .query('recipeFavorites')
      .withIndex('by_userId_recipeId', (q) =>
        q.eq('userId', userId).eq('recipeId', recipe._id),
      )
      .first();

    // Get all products for this recipe
    const recipeProducts = await ctx.db
      .query('recipeProducts')
      .withIndex('by_recipeId', (q) => q.eq('recipeId', recipe._id))
      .collect();

    const productsWithDetails = await Promise.all(
      recipeProducts.map(async (rp) => {
        const product = await ctx.db.get(rp.productId);
        return {
          ...rp,
          product,
        };
      }),
    );

    return {
      ...recipe,
      totalTime: recipe.prepTime + recipe.cookTime,
      isFavorite: !!favorite,
      products: productsWithDetails,
    };
  },
});

import { ConvexError, v } from 'convex/values';
import { api } from '../_generated/api';
import { action } from '../_generated/server';
import { ensureActionAuth } from '../auth';
import { getMarmitonRecipe, searchMarmitonRecipes } from './marmiton';
import { type MatchedMarmitonRecipe, matchRecipeProducts } from './product_matcher';

export const searchMarmiton = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    await ensureActionAuth(ctx);

    try {
      return await searchMarmitonRecipes(query);
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : 'Marmiton import failed');
    }
  },
});

export const importMarmiton = action({
  args: { url: v.string() },
  handler: async (ctx, { url }): Promise<MatchedMarmitonRecipe> => {
    await ensureActionAuth(ctx);

    let recipe;
    try {
      recipe = await getMarmitonRecipe(url);
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : 'Marmiton import failed');
    }
    const products = await ctx.runQuery(api.products.queries.getProducts, {});
    return matchRecipeProducts(recipe, products);
  },
});

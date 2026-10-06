import { ConvexError, v } from 'convex/values';
import { api } from '../_generated/api';
import { action } from '../_generated/server';
import { type MarmitonRecipe, searchMarmitonRecipe } from './marmiton';
import { type MatchedMarmitonRecipe, matchRecipeProducts } from './product_matcher';

export const searchMarmiton = action({
  args: { query: v.string() },
  handler: async (ctx, { query }): Promise<MatchedMarmitonRecipe | null> => {
    if (!(await ctx.auth.getUserIdentity())) throw new ConvexError('Unauthorized');

    let recipe: MarmitonRecipe | null;
    try {
      recipe = await searchMarmitonRecipe(query);
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : 'Marmiton import failed');
    }
    if (!recipe) return null;

    const products = await ctx.runQuery(api.products.queries.getProducts, {});
    return matchRecipeProducts(recipe, products);
  },
});

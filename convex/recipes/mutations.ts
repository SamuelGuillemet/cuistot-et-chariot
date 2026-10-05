import { ConvexError, v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { requireAuthUserId } from '../auth';
import { productUnitEnum } from '../products/schema';
import { recipeDifficultyEnum, recipesPatchBuilder } from './schema';

export const createRecipe = mutation({
  args: {
    name: v.string(),
    instructions: v.array(
      v.object({
        text: v.string(),
        order: v.number(),
      }),
    ),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    difficulty: recipeDifficultyEnum,
    products: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number(),
        unit: productUnitEnum,
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    // Recipe names are unique in the shared collection.
    const existingRecipe = await ctx.db
      .query('recipes')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingRecipe) {
      throw new ConvexError('A recipe with this name already exists');
    }

    // Verify all ingredient products exist in the shared catalog.
    for (const productData of args.products) {
      const product = await ctx.db.get(productData.productId as Id<'products'>);
      if (!product) {
        throw new ConvexError('Product not found');
      }
    }

    // Create the recipe
    const recipeId = await ctx.db.insert('recipes', {
      name: args.name,
      instructions: args.instructions,
      servings: args.servings,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      difficulty: args.difficulty,
    });

    // Add products to the recipe
    for (const productData of args.products) {
      await ctx.db.insert('recipeProducts', {
        recipeId,
        productId: productData.productId as Id<'products'>,
        quantity: productData.quantity,
        unit: productData.unit,
      });
    }

    return recipeId;
  },
});

export const updateRecipe = mutation({
  args: {
    recipeId: v.string(),
    name: v.optional(v.string()),
    instructions: v.optional(
      v.array(
        v.object({
          text: v.string(),
          order: v.number(),
        }),
      ),
    ),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    difficulty: v.optional(recipeDifficultyEnum),
    products: v.optional(
      v.array(
        v.object({
          productId: v.string(),
          quantity: v.number(),
          unit: productUnitEnum,
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe) {
      throw new ConvexError('Recipe not found');
    }

    // Check if a recipe with the new name already exists (if name is being changed)
    if (args.name && args.name !== recipe.name) {
      const existingRecipe = await ctx.db
        .query('recipes')
        .withIndex('by_name', (q) => q.eq('name', args.name!))
        .first();

      if (existingRecipe && existingRecipe._id !== recipe._id) {
        throw new ConvexError('A recipe with this name already exists');
      }
    }

    const updateData = recipesPatchBuilder(args, ['recipeId', 'products']);

    await ctx.db.patch(recipe._id, updateData);

    // Update products if provided
    if (args.products !== undefined) {
      // Verify all ingredient products exist in the shared catalog.
      for (const productData of args.products) {
        const product = await ctx.db.get(productData.productId as Id<'products'>);
        if (!product) {
          throw new ConvexError('Product not found');
        }
      }

      // Delete all existing recipe products
      const existingRecipeProducts = await ctx.db
        .query('recipeProducts')
        .withIndex('by_recipeId', (q) => q.eq('recipeId', recipe._id))
        .collect();

      for (const rp of existingRecipeProducts) {
        await ctx.db.delete(rp._id);
      }

      // Add new products
      for (const productData of args.products) {
        await ctx.db.insert('recipeProducts', {
          recipeId: recipe._id,
          productId: productData.productId as Id<'products'>,
          quantity: productData.quantity,
          unit: productData.unit,
        });
      }
    }
  },
});

export const deleteRecipe = mutation({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);
    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe) {
      throw new ConvexError('Recipe not found');
    }

    // Delete all associated recipe products
    const recipeProducts = await ctx.db
      .query('recipeProducts')
      .withIndex('by_recipeId', (q) => q.eq('recipeId', recipe._id))
      .collect();

    for (const rp of recipeProducts) {
      await ctx.db.delete(rp._id);
    }

    // Delete all favorites for this recipe
    const favorites = await ctx.db
      .query('recipeFavorites')
      .withIndex('by_recipeId', (q) => q.eq('recipeId', recipe._id))
      .collect();

    for (const fav of favorites) {
      await ctx.db.delete(fav._id);
    }

    // Delete the recipe
    await ctx.db.delete(recipe._id);
  },
});

export const toggleRecipeFavorite = mutation({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    // The recipe collection is shared by authenticated users.
    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe) {
      throw new ConvexError('Recipe not found');
    }

    // Check if already a favorite
    const existingFavorite = await ctx.db
      .query('recipeFavorites')
      .withIndex('by_userId_recipeId', (q) => q.eq('userId', userId).eq('recipeId', recipe._id))
      .first();

    if (existingFavorite) {
      // Remove from favorites
      await ctx.db.delete(existingFavorite._id);
      return { isFavorite: false };
    }
    // Add to favorites
    await ctx.db.insert('recipeFavorites', {
      recipeId: recipe._id,
      userId,
    });
    return { isFavorite: true };
  },
});

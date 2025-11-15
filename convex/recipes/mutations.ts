import { ConvexError, v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { productUnitEnum } from '../products/schema';
import { mutationWithRLS } from './rls';
import { recipeDifficultyEnum, recipesPatchBuilder } from './schema';

export const createRecipe = mutationWithRLS({
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
    const { householdId } = ctx;

    // Check if a recipe with the same name already exists in this household
    const existingRecipe = await ctx.db
      .query('recipes')
      .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
      .filter((q) => q.eq(q.field('name'), args.name))
      .first();

    if (existingRecipe) {
      throw new ConvexError('A recipe with this name already exists');
    }

    // Verify all products belong to the household
    for (const productData of args.products) {
      const product = await ctx.db.get(productData.productId as Id<'products'>);
      if (product?.householdId !== householdId) {
        throw new ConvexError('Product not found in this household');
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
      householdId,
    });

    // Add products to the recipe
    for (const productData of args.products) {
      await ctx.db.insert('recipeProducts', {
        recipeId,
        productId: productData.productId as Id<'products'>,
        quantity: productData.quantity,
        unit: productData.unit,
        householdId,
      });
    }

    return recipeId;
  },
});

export const updateRecipe = mutationWithRLS({
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
    const { householdId } = ctx;

    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe) {
      throw new ConvexError('Recipe not found');
    }

    // Check if a recipe with the new name already exists (if name is being changed)
    if (args.name && args.name !== recipe.name) {
      const existingRecipe = await ctx.db
        .query('recipes')
        .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
        .filter((q) =>
          q.and(
            q.eq(q.field('name'), args.name),
            q.neq(q.field('_id'), args.recipeId),
          ),
        )
        .first();

      if (existingRecipe) {
        throw new ConvexError('A recipe with this name already exists');
      }
    }

    const updateData = recipesPatchBuilder(args, ['recipeId', 'products']);

    await ctx.db.patch(recipe._id, updateData);

    // Update products if provided
    if (args.products !== undefined) {
      // Verify all products belong to the household
      for (const productData of args.products) {
        const product = await ctx.db.get(
          productData.productId as Id<'products'>,
        );
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
          householdId,
        });
      }
    }
  },
});

export const deleteRecipe = mutationWithRLS({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
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

export const toggleRecipeFavorite = mutationWithRLS({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { householdId, userId } = ctx;

    // Verify the recipe belongs to the household
    const recipe = await ctx.db.get(args.recipeId as Id<'recipes'>);
    if (!recipe) {
      throw new ConvexError('Recipe not found');
    }

    // Check if already a favorite
    const existingFavorite = await ctx.db
      .query('recipeFavorites')
      .withIndex('by_userId_recipeId', (q) =>
        q.eq('userId', userId).eq('recipeId', recipe._id),
      )
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
      householdId,
    });
    return { isFavorite: true };
  },
});

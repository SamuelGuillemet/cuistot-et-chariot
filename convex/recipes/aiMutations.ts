import { ConvexError, v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { productCategoryEnum, productUnitEnum } from '../products/schema';
import { mutationWithRLS } from './rls';
import { recipeDifficultyEnum } from './schema';

/**
 * Combined mutation: creates missing products then creates the recipe with all products.
 * Designed for the AI chatbot so it can do everything in a single call.
 */
export const createRecipeWithProducts = mutationWithRLS({
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
    // Products that already exist in the household — referenced by ID
    existingProducts: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
        unit: productUnitEnum,
      }),
    ),
    // Products that need to be created first
    newProducts: v.array(
      v.object({
        name: v.string(),
        category: productCategoryEnum,
        defaultUnit: productUnitEnum,
        icon: v.string(),
        // recipe-specific fields
        quantity: v.number(),
        unit: productUnitEnum,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    // Check if a recipe with the same name already exists
    const existingRecipe = await ctx.db
      .query('recipes')
      .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
      .filter((q) => q.eq(q.field('name'), args.name))
      .first();

    if (existingRecipe) {
      throw new ConvexError('A recipe with this name already exists');
    }

    // Verify all existing products belong to the household
    for (const productData of args.existingProducts) {
      const product = await ctx.db.get(productData.productId);
      if (product?.householdId !== householdId) {
        throw new ConvexError(
          `Product ${productData.productId} not found in this household`,
        );
      }
    }

    // Create new products
    const createdProductIds: Array<{
      productId: Id<'products'>;
      quantity: number;
      unit: (typeof args.newProducts)[number]['unit'];
    }> = [];

    for (const newProduct of args.newProducts) {
      // Check if a product with this name already exists
      const existing = await ctx.db
        .query('products')
        .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
        .filter((q) => q.eq(q.field('name'), newProduct.name))
        .first();

      const productId = existing
        ? existing._id
        : await ctx.db.insert('products', {
            name: newProduct.name,
            category: newProduct.category,
            defaultUnit: newProduct.defaultUnit,
            icon: newProduct.icon,
            householdId,
          });

      createdProductIds.push({
        productId,
        quantity: newProduct.quantity,
        unit: newProduct.unit,
      });
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

    // Link all products to the recipe
    const allProducts = [...args.existingProducts, ...createdProductIds];
    for (const productData of allProducts) {
      await ctx.db.insert('recipeProducts', {
        recipeId,
        productId: productData.productId,
        quantity: productData.quantity,
        unit: productData.unit,
        householdId,
      });
    }

    return {
      recipeId,
      createdProducts: createdProductIds.length,
      totalProducts: allProducts.length,
    };
  },
});

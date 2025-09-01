import { ConvexError, v } from 'convex/values';
import { mutationWithRLS } from './rls';
import {
  productCategoryEnum,
  productsPatchBuilder,
  productUnitEnum,
} from './schema';

export const createProduct = mutationWithRLS({
  args: {
    icon: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: productCategoryEnum,
    defaultUnit: productUnitEnum,
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    // Check if a product with the same name already exists in this household
    const existingProduct = await ctx.db
      .query('products')
      .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
      .filter((q) => q.eq(q.field('name'), args.name))
      .first();

    if (existingProduct) {
      throw new ConvexError('A product with this name already exists');
    }

    const productId = await ctx.db.insert('products', {
      ...args,
      householdId,
    });

    return productId;
  },
});

export const updateProduct = mutationWithRLS({
  args: {
    productId: v.id('products'),
    icon: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(productCategoryEnum),
    defaultUnit: v.optional(productUnitEnum),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const product = await ctx.db.get(args.productId);
    if (!product || product.householdId !== householdId) {
      throw new ConvexError('Product not found in this household');
    }

    // Check if a product with the new name already exists (if name is being changed)
    if (args.name && args.name !== product.name) {
      const existingProduct = await ctx.db
        .query('products')
        .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
        .filter((q) =>
          q.and(
            q.eq(q.field('name'), args.name),
            q.neq(q.field('_id'), args.productId),
          ),
        )
        .first();

      if (existingProduct) {
        throw new ConvexError('A product with this name already exists');
      }
    }

    const updateData = productsPatchBuilder(args, ['productId']);

    await ctx.db.patch(args.productId, updateData);
  },
});

export const deleteProduct = mutationWithRLS({
  args: {
    productId: v.id('products'),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const product = await ctx.db.get(args.productId);
    if (!product || product.householdId !== householdId) {
      throw new ConvexError('Product not found in this household');
    }

    await ctx.db.delete(args.productId);
  },
});

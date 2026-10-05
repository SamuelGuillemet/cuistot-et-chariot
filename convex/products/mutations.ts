import { ConvexError, v } from 'convex/values';
import { mutation } from '../_generated/server';
import { requireAuthUserId } from '../auth';
import { productCategoryEnum, productsPatchBuilder, productUnitEnum } from './schema';

export const createProduct = mutation({
  args: {
    icon: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: productCategoryEnum,
    defaultUnit: productUnitEnum,
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    // Product names are unique in the shared catalog.
    const existingProduct = await ctx.db
      .query('products')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingProduct) {
      throw new ConvexError('A product with this name already exists');
    }

    return await ctx.db.insert('products', args);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id('products'),
    icon: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(productCategoryEnum),
    defaultUnit: v.optional(productUnitEnum),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError('Product not found');
    }

    // Check if a product with the new name already exists (if name is being changed)
    if (args.name && args.name !== product.name) {
      const existingProduct = await ctx.db
        .query('products')
        .withIndex('by_name', (q) => q.eq('name', args.name!))
        .first();

      if (existingProduct && existingProduct._id !== product._id) {
        throw new ConvexError('A product with this name already exists');
      }
    }

    const updateData = productsPatchBuilder(args, ['productId']);

    await ctx.db.patch(args.productId, updateData);
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id('products'),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError('Product not found');
    }

    await ctx.db.delete(args.productId);
  },
});

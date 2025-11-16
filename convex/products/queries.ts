import { v } from 'convex/values';
import { queryWithRLS } from './rls';
import { productCategoryEnum } from './schema';

export const getProducts = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    const { householdId } = ctx;

    const products = await ctx.db
      .query('products')
      .withIndex('by_householdId_name', (q) => q.eq('householdId', householdId))
      .order('asc')
      .collect();

    return products;
  },
});

export const getProductById = queryWithRLS({
  args: {
    productId: v.id('products'),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const product = await ctx.db.get(args.productId);

    if (product?.householdId !== householdId) {
      return null;
    }

    return product;
  },
});

export const getProductsByCategory = queryWithRLS({
  args: {
    category: productCategoryEnum,
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    const products = await ctx.db
      .query('products')
      .withIndex('by_householdId_category', (q) =>
        q.eq('householdId', householdId).eq('category', args.category),
      )
      .collect();

    return products;
  },
});

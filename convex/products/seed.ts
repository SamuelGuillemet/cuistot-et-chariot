import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const seedProducts = internalMutation({
  args: {
    householdId: v.id('households'),
  },
  handler: async (ctx, args) => {
    const { householdId } = args;

    const products = [
      // Dairy products
      {
        icon: 'milk',
        name: 'Lait',
        description: 'Lait demi-écrémé 1L',
        category: 'dairy' as const,
        defaultUnit: 'l' as const,
      },
      {
        icon: 'butter',
        name: 'Beurre',
        description: 'Beurre doux 250g',
        category: 'dairy' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'cheese',
        name: 'Fromage',
        description: 'Fromage cheddar 200g',
        category: 'dairy' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'egg',
        name: 'Œuf',
        description: 'Œufs fermiers x12',
        category: 'dairy' as const,
        defaultUnit: 'pieces' as const,
      },
      // Meat products
      {
        icon: 'chicken_leg',
        name: 'Poulet',
        description: 'Blanc de poulet fermier',
        category: 'meat' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 't_bone_steak',
        name: 'Boeuf',
        description: 'Steak haché 500g',
        category: 'meat' as const,
        defaultUnit: 'g' as const,
      },
      // Fish products
      {
        icon: 'fish',
        name: 'Saumon',
        description: 'Filet de saumon frais',
        category: 'fish' as const,
        defaultUnit: 'g' as const,
      },
      // Vegetables
      {
        icon: 'salad',
        name: 'Laitue',
        description: 'Laitue verte fraîche',
        category: 'vegetables' as const,
        defaultUnit: 'pieces' as const,
      },
      {
        icon: 'tomato',
        name: 'Tomate',
        description: 'Tomates rouges mûres',
        category: 'vegetables' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'onion',
        name: 'Oignon',
        description: 'Oignons jaunes',
        category: 'vegetables' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'garlic',
        name: 'Ail',
        description: "Gousses d'ail frais",
        category: 'vegetables' as const,
        defaultUnit: 'pieces' as const,
      },
      // Fruits
      {
        icon: 'apple',
        name: 'Pomme',
        description: 'Pommes Golden',
        category: 'fruits' as const,
        defaultUnit: 'pieces' as const,
      },
      {
        icon: 'banana',
        name: 'Banane',
        description: 'Bananes mûres',
        category: 'fruits' as const,
        defaultUnit: 'pieces' as const,
      },
      {
        icon: 'lemon',
        name: 'Citron',
        description: 'Citrons frais',
        category: 'fruits' as const,
        defaultUnit: 'pieces' as const,
      },
      // Bakery
      {
        icon: 'whole_grain_bread',
        name: 'Pain',
        description: 'Pain complet 500g',
        category: 'bakery' as const,
        defaultUnit: 'pieces' as const,
      },
      // Grains
      {
        icon: 'spaghetti',
        name: 'Pâtes',
        description: 'Spaghetti 500g',
        category: 'grains' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'chopsticks_bowl',
        name: 'Riz',
        description: 'Riz blanc 1kg',
        category: 'grains' as const,
        defaultUnit: 'g' as const,
      },
      // Condiments
      {
        icon: 'salt',
        name: 'Sel',
        description: 'Sel de table',
        category: 'condiments' as const,
        defaultUnit: 'g' as const,
      },
      {
        icon: 'olive_oil',
        name: "Huile d'olive",
        description: "Huile d'olive vierge extra 500ml",
        category: 'condiments' as const,
        defaultUnit: 'ml' as const,
      },
    ];

    const productIds: Record<string, string> = {};

    for (const product of products) {
      const existingProduct = await ctx.db
        .query('products')
        .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
        .filter((q) => q.eq(q.field('name'), product.name))
        .first();

      if (existingProduct) {
        productIds[product.name] = existingProduct._id;
      } else {
        const id = await ctx.db.insert('products', {
          ...product,
          householdId,
        });
        productIds[product.name] = id;
      }
    }

    return { success: true, productCount: Object.keys(productIds).length };
  },
});

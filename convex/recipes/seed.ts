import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { internalMutation } from '../_generated/server';

export const seedRecipes = internalMutation({
  args: {
    householdId: v.id('households'),
  },
  handler: async (ctx, args) => {
    const { householdId } = args;

    const productIds: Record<string, string> = {};

    // Fetch existing products in the household to map names to IDs
    const existingProducts = await ctx.db
      .query('products')
      .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
      .collect();

    for (const product of existingProducts) {
      productIds[product.name] = product._id;
    }

    const recipes = [
      {
        name: 'Pâtes à la Carbonara',
        instructions: [
          {
            order: 0,
            text: 'Cuire les pâtes selon les instructions du paquet.',
          },
          { order: 1, text: 'Pendant ce temps, faire revenir le lard.' },
          {
            order: 2,
            text: 'Dans un bol, battre les œufs avec le fromage râpé.',
          },
          {
            order: 3,
            text: 'Mélanger les pâtes chaudes avec le lard et la sauce aux œufs.',
          },
          { order: 4, text: 'Servir immédiatement.' },
        ],
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        difficulty: 'easy' as const,
        products: [
          { name: 'Pâtes', quantity: 400, unit: 'g' as const },
          { name: 'Œuf', quantity: 3, unit: 'pieces' as const },
          { name: 'Fromage', quantity: 100, unit: 'g' as const },
        ],
      },
      {
        name: 'Salade Tomate Oignon',
        instructions: [
          { order: 0, text: 'Laver et découper les tomates en quartiers.' },
          { order: 1, text: 'Émincer finement les oignons.' },
          { order: 2, text: 'Mélanger dans un saladier.' },
          { order: 3, text: "Arroser d'huile d'olive et de sel." },
          { order: 4, text: 'Mélanger délicatement.' },
        ],
        servings: 4,
        prepTime: 10,
        cookTime: 0,
        difficulty: 'easy' as const,
        products: [
          { name: 'Tomate', quantity: 500, unit: 'g' as const },
          { name: 'Oignon', quantity: 1, unit: 'pieces' as const },
          { name: "Huile d'olive", quantity: 50, unit: 'ml' as const },
        ],
      },
      {
        name: 'Riz à la Volaille',
        instructions: [
          { order: 0, text: 'Découper le poulet en cubes.' },
          { order: 1, text: 'Faire revenir le poulet à la poêle 10 minutes.' },
          { order: 2, text: 'Cuire le riz selon les instructions du paquet.' },
          { order: 3, text: 'Mélanger le poulet cuit avec le riz.' },
          { order: 4, text: 'Assaisonner avec sel et ail.' },
          { order: 5, text: 'Servir chaud.' },
        ],
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        difficulty: 'medium' as const,
        products: [
          { name: 'Riz', quantity: 250, unit: 'g' as const },
          { name: 'Poulet', quantity: 500, unit: 'g' as const },
          { name: 'Oignon', quantity: 1, unit: 'pieces' as const },
          { name: 'Ail', quantity: 2, unit: 'pieces' as const },
        ],
      },
      {
        name: 'Saumon aux Légumes',
        instructions: [
          { order: 0, text: 'Préchauffer le four à 180°C.' },
          { order: 1, text: 'Disposer le saumon sur du papier aluminium.' },
          { order: 2, text: 'Ajouter les légumes (tomate, oignon) autour.' },
          { order: 3, text: "Arroser d'huile d'olive et assaisonner." },
          { order: 4, text: 'Envelopper et cuire 20 minutes.' },
          { order: 5, text: 'Servir chaud.' },
        ],
        servings: 2,
        prepTime: 10,
        cookTime: 20,
        difficulty: 'medium' as const,
        products: [
          { name: 'Saumon', quantity: 300, unit: 'g' as const },
          { name: 'Tomate', quantity: 200, unit: 'g' as const },
          { name: 'Oignon', quantity: 1, unit: 'pieces' as const },
          { name: "Huile d'olive", quantity: 30, unit: 'ml' as const },
        ],
      },
      {
        name: 'Steak Haché Fromage',
        instructions: [
          { order: 0, text: 'Façonner les steaks hachés en galettes.' },
          { order: 1, text: 'Cuire à la poêle 5 minutes de chaque côté.' },
          {
            order: 2,
            text: 'Ajouter le fromage sur chaque steak en fin de cuisson.',
          },
          { order: 3, text: 'Laisser le fromage fondre 1-2 minutes.' },
          { order: 4, text: 'Servir avec une salade fraîche.' },
        ],
        servings: 2,
        prepTime: 5,
        cookTime: 12,
        difficulty: 'easy' as const,
        products: [
          { name: 'Boeuf', quantity: 400, unit: 'g' as const },
          { name: 'Fromage', quantity: 100, unit: 'g' as const },
          { name: 'Laitue', quantity: 1, unit: 'pieces' as const },
        ],
      },
      {
        name: "Soupe à l'Oignon",
        instructions: [
          { order: 0, text: 'Émincer les oignons très finement.' },
          {
            order: 1,
            text: 'Faire revenir les oignons dans du beurre 5 minutes.',
          },
          { order: 2, text: "Ajouter 1L d'eau et porter à ébullition." },
          { order: 3, text: 'Laisser mijoter 30 minutes.' },
          { order: 4, text: 'Assaisonner avec sel et ail.' },
          { order: 5, text: 'Servir chaud avec du pain.' },
        ],
        servings: 4,
        prepTime: 10,
        cookTime: 35,
        difficulty: 'easy' as const,
        products: [
          { name: 'Oignon', quantity: 1000, unit: 'g' as const },
          { name: 'Beurre', quantity: 50, unit: 'g' as const },
          { name: 'Ail', quantity: 3, unit: 'pieces' as const },
        ],
      },
      {
        name: 'Omelette aux Fines Herbes',
        instructions: [
          { order: 0, text: 'Battre les œufs dans un bol.' },
          { order: 1, text: 'Faire fondre le beurre dans une poêle.' },
          { order: 2, text: 'Verser les œufs battus.' },
          {
            order: 3,
            text: "Laisser cuire 3-4 minutes jusqu'à la mi-cuisson.",
          },
          { order: 4, text: "Plier l'omelette et servir." },
        ],
        servings: 2,
        prepTime: 5,
        cookTime: 5,
        difficulty: 'easy' as const,
        products: [
          { name: 'Œuf', quantity: 3, unit: 'pieces' as const },
          { name: 'Beurre', quantity: 30, unit: 'g' as const },
        ],
      },
      {
        name: 'Boeuf à la Sauce Tomate',
        instructions: [
          { order: 0, text: 'Couper le boeuf en cubes.' },
          {
            order: 1,
            text: "Faire revenir le boeuf à la poêle jusqu'à coloration.",
          },
          { order: 2, text: "Ajouter les tomates et l'ail." },
          { order: 3, text: 'Laisser mijoter 45 minutes à couvert.' },
          { order: 4, text: 'Servir avec du riz ou des pâtes.' },
        ],
        servings: 4,
        prepTime: 15,
        cookTime: 50,
        difficulty: 'medium' as const,
        products: [
          { name: 'Boeuf', quantity: 800, unit: 'g' as const },
          { name: 'Tomate', quantity: 400, unit: 'g' as const },
          { name: 'Ail', quantity: 4, unit: 'pieces' as const },
          { name: "Huile d'olive", quantity: 50, unit: 'ml' as const },
        ],
      },
    ];

    const recipeIds: Record<string, string> = {};

    for (const recipe of recipes) {
      const existingRecipe = await ctx.db
        .query('recipes')
        .withIndex('by_householdId', (q) => q.eq('householdId', householdId))
        .filter((q) => q.eq(q.field('name'), recipe.name))
        .first();

      if (existingRecipe) {
        recipeIds[recipe.name] = existingRecipe._id;
        continue;
      }

      const recipeId = await ctx.db.insert('recipes', {
        name: recipe.name,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        householdId,
      });

      recipeIds[recipe.name] = recipeId;

      // Add recipe products
      for (const productData of recipe.products) {
        const productId = productIds[productData.name];
        if (productId) {
          await ctx.db.insert('recipeProducts', {
            recipeId,
            productId: productId as Id<'products'>,
            quantity: productData.quantity,
            unit: productData.unit,
            householdId,
          });
        }
      }
    }

    return {
      success: true,
      recipeCount: Object.keys(recipeIds).length,
    };
  },
});

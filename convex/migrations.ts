import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const clearLegacyHouseholdIdsProducts = migrations.define({
  table: 'products',
  migrateOne: async () => ({
    householdId: undefined,
  }),
});

export const clearLegacyHouseholdIdsRecipes = migrations.define({
  table: 'recipes',
  migrateOne: async () => ({
    householdId: undefined,
  }),
});

export const clearLegacyHouseholdIdsRecipeProducts = migrations.define({
  table: 'recipeProducts',
  migrateOne: async () => ({
    householdId: undefined,
  }),
});

export const clearLegacyHouseholdIdsRecipeFavorites = migrations.define({
  table: 'recipeFavorites',
  migrateOne: async () => ({
    householdId: undefined,
  }),
});

export const runAll = migrations.runner([
  internal.migrations.clearLegacyHouseholdIdsProducts,
  internal.migrations.clearLegacyHouseholdIdsRecipes,
  internal.migrations.clearLegacyHouseholdIdsRecipeProducts,
  internal.migrations.clearLegacyHouseholdIdsRecipeFavorites,
]);

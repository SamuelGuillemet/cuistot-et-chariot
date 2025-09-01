import type { Doc } from 'convex/_generated/dataModel';
import { createPatchBuilder, makeEnum } from 'convex/helpers';
import { defineTable } from 'convex/server';
import type { ProductCategory, ProductUnit } from 'convex/types';
import { v } from 'convex/values';

export const productCategoryEnum = makeEnum<ProductCategory>([
  'dairy',
  'meat',
  'vegetables',
  'fruits',
  'grains',
  'bakery',
  'frozen',
  'beverages',
  'snacks',
  'condiments',
  'cleaning',
  'personal-care',
  'other',
]);

export const productUnitEnum = makeEnum<ProductUnit>([
  'kg',
  'g',
  'l',
  'ml',
  'pieces',
  'pack',
  'bottle',
  'can',
  'box',
  'bag',
  'cup',
  'tablespoon',
  'teaspoon',
]);

export const productsSchema = defineTable({
  icon: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  householdId: v.id('households'),
  category: productCategoryEnum,
  defaultUnit: productUnitEnum,
})
  .index('by_householdId', ['householdId'])
  .index('by_category', ['category'])
  .index('by_householdId_category', ['householdId', 'category']);

export const productsPatchBuilder = createPatchBuilder<Doc<'products'>>();

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { createPatchBuilder, makeEnum } from '../helpers';
import {
  CATEGORY_DISPLAY_NAMES,
  PRODUCT_UNITS,
  type ProductCategory,
  type ProductUnit,
} from '../types';

export const productCategoryEnum = makeEnum<ProductCategory>(
  Object.keys(CATEGORY_DISPLAY_NAMES) as ProductCategory[],
);

export const productUnitEnum = makeEnum<ProductUnit>(
  Object.keys(PRODUCT_UNITS) as ProductUnit[],
);

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
  .index('by_householdId_category', ['householdId', 'category'])
  .index('by_householdId_name', ['householdId', 'name']);

export const productsPatchBuilder = createPatchBuilder<Doc<'products'>>();

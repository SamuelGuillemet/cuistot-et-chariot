import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { householdsSchema } from './households/schema';
import { householdMembersSchema } from './households_members/schema';
import { productsSchema } from './products/schema';
import {
  recipeFavoritesSchema,
  recipeProductsSchema,
  recipesSchema,
} from './recipes/schema';

const usersSchema = defineTable({
  authId: v.string(),
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
}).index('by_authId', ['authId']);

export default defineSchema({
  users: usersSchema,
  households: householdsSchema,
  householdMembers: householdMembersSchema,
  products: productsSchema,
  recipes: recipesSchema,
  recipeProducts: recipeProductsSchema,
  recipeFavorites: recipeFavoritesSchema,
});

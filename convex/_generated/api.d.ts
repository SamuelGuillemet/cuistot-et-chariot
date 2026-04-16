/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as helpers from "../helpers.js";
import type * as households_mutations from "../households/mutations.js";
import type * as households_queries from "../households/queries.js";
import type * as households_rls from "../households/rls.js";
import type * as households_members_mutations from "../households_members/mutations.js";
import type * as households_members_queries from "../households_members/queries.js";
import type * as households_members_rls from "../households_members/rls.js";
import type * as http from "../http.js";
import type * as meal_plans_mutations from "../meal_plans/mutations.js";
import type * as meal_plans_queries from "../meal_plans/queries.js";
import type * as meal_plans_rls from "../meal_plans/rls.js";
import type * as migrations from "../migrations.js";
import type * as products_mutations from "../products/mutations.js";
import type * as products_queries from "../products/queries.js";
import type * as products_rls from "../products/rls.js";
import type * as products_seed from "../products/seed.js";
import type * as recipes_mutations from "../recipes/mutations.js";
import type * as recipes_queries from "../recipes/queries.js";
import type * as recipes_rls from "../recipes/rls.js";
import type * as recipes_seed from "../recipes/seed.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  helpers: typeof helpers;
  "households/mutations": typeof households_mutations;
  "households/queries": typeof households_queries;
  "households/rls": typeof households_rls;
  "households_members/mutations": typeof households_members_mutations;
  "households_members/queries": typeof households_members_queries;
  "households_members/rls": typeof households_members_rls;
  http: typeof http;
  "meal_plans/mutations": typeof meal_plans_mutations;
  "meal_plans/queries": typeof meal_plans_queries;
  "meal_plans/rls": typeof meal_plans_rls;
  migrations: typeof migrations;
  "products/mutations": typeof products_mutations;
  "products/queries": typeof products_queries;
  "products/rls": typeof products_rls;
  "products/seed": typeof products_seed;
  "recipes/mutations": typeof recipes_mutations;
  "recipes/queries": typeof recipes_queries;
  "recipes/rls": typeof recipes_rls;
  "recipes/seed": typeof recipes_seed;
  types: typeof types;
  users: typeof users;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};

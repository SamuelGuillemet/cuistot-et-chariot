import { v } from "convex/values";

/**
 * Convex Validators for Recipe Management Application
 * 
 * This file contains reusable validation helpers for:
 * - Data validation (required fields, formats, ranges)
 * - Business logic validation (quantities > 0, proper relationships)
 * - Security validation (user permissions, home access)
 * - Type safety with TypeScript
 */

// =============================================================================
// COMMON VALIDATION HELPERS
// =============================================================================

/**
 * Common field validators
 */
export const commonValidators = {
  // Basic data types with validation
  nonEmptyString: v.string(), // Will be enhanced with length validation in mutations
  positiveNumber: v.number(), // Will be enhanced with > 0 validation in mutations
  nonNegativeNumber: v.number(), // Will be enhanced with >= 0 validation in mutations
  email: v.string(), // Will be enhanced with email format validation in mutations
  url: v.optional(v.string()), // Will be enhanced with URL format validation in mutations
  
  // Timestamps
  timestamp: v.number(),
  
  // Enums for categories
  foodCategories: v.union(
    v.literal("vegetables"),
    v.literal("fruits"),
    v.literal("meat"),
    v.literal("fish"),
    v.literal("dairy"),
    v.literal("grains"),
    v.literal("spices"),
    v.literal("beverages"),
    v.literal("snacks")
  ),
  
  nonFoodCategories: v.union(
    v.literal("cleaning"),
    v.literal("hygiene"),
    v.literal("household"),
    v.literal("pet-care"),
    v.literal("health")
  ),
  
  allCategories: v.union(
    v.literal("vegetables"),
    v.literal("fruits"),
    v.literal("meat"),
    v.literal("fish"),
    v.literal("dairy"),
    v.literal("grains"),
    v.literal("spices"),
    v.literal("beverages"),
    v.literal("snacks"),
    v.literal("cleaning"),
    v.literal("hygiene"),
    v.literal("household"),
    v.literal("pet-care"),
    v.literal("health")
  ),
  
  // User roles
  userRole: v.union(v.literal("owner"), v.literal("member")),
  
  // Meal types
  mealType: v.union(
    v.literal("breakfast"),
    v.literal("lunch"),
    v.literal("dinner"),
    v.literal("snack")
  ),
  
  // Recipe meal types (more comprehensive)
  recipeMealType: v.union(
    v.literal("breakfast"),
    v.literal("lunch"),
    v.literal("dinner"),
    v.literal("snack"),
    v.literal("dessert"),
    v.literal("appetizer")
  ),
  
  // Difficulty levels
  difficultyLevel: v.union(
    v.literal("easy"),
    v.literal("medium"),
    v.literal("hard")
  ),
  
  // Status enums
  userHomeStatus: v.union(
    v.literal("active"),
    v.literal("invited"),
    v.literal("inactive")
  ),
  
  inventoryStatus: v.union(
    v.literal("in-stock"),
    v.literal("low-stock"),
    v.literal("out-of-stock"),
    v.literal("expired")
  ),
  
  menuStatus: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("archived")
  ),
  
  menuRecipeStatus: v.union(
    v.literal("planned"),
    v.literal("prepared"),
    v.literal("completed"),
    v.literal("skipped")
  ),
  
  shoppingListStatus: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  
  shoppingListItemStatus: v.union(
    v.literal("pending"),
    v.literal("purchased"),
    v.literal("unavailable"),
    v.literal("substituted"),
    v.literal("skipped")
  ),
  
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high")
  ),
  
  // Units system
  unitSystem: v.union(v.literal("metric"), v.literal("imperial")),
  
  // Common units (string-based for flexibility)
  commonUnits: v.string(), // kg, g, l, ml, piece, bunch, cup, tbsp, tsp, etc.
  
  // Nutritional information structure
  nutrition: v.object({
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fat: v.optional(v.number()),
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
  }),
};

// =============================================================================
// USER VALIDATORS
// =============================================================================

export const userValidators = {
  // Create user
  createUser: v.object({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    preferredUnits: v.optional(commonValidators.unitSystem),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
  }),
  
  // Update user profile
  updateUser: v.object({
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    preferredUnits: v.optional(commonValidators.unitSystem),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
  }),
};

// =============================================================================
// HOME VALIDATORS
// =============================================================================

export const homeValidators = {
  // Create home
  createHome: v.object({
    name: v.string(),
    description: v.optional(v.string()),
    defaultUnits: commonValidators.unitSystem,
    currency: v.string(),
    country: v.optional(v.string()),
  }),
  
  // Update home
  updateHome: v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultUnits: v.optional(commonValidators.unitSystem),
    currency: v.optional(v.string()),
    country: v.optional(v.string()),
  }),
  
  // Invite user to home
  inviteUser: v.object({
    homeId: v.id("homes"),
    email: v.string(),
    role: commonValidators.userRole,
    canManageProducts: v.optional(v.boolean()),
    canManageRecipes: v.optional(v.boolean()),
    canManageInventory: v.optional(v.boolean()),
    canManageMenus: v.optional(v.boolean()),
    canManageShoppingLists: v.optional(v.boolean()),
  }),
  
  // Update user permissions in home
  updateUserPermissions: v.object({
    userHomeId: v.id("userHomes"),
    role: v.optional(commonValidators.userRole),
    canManageProducts: v.optional(v.boolean()),
    canManageRecipes: v.optional(v.boolean()),
    canManageInventory: v.optional(v.boolean()),
    canManageMenus: v.optional(v.boolean()),
    canManageShoppingLists: v.optional(v.boolean()),
    canManageUsers: v.optional(v.boolean()),
  }),
};

// =============================================================================
// PRODUCT VALIDATORS
// =============================================================================

export const productValidators = {
  // Create product
  createProduct: v.object({
    homeId: v.id("homes"),
    name: v.string(),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()),
    category: commonValidators.allCategories,
    subcategory: v.optional(v.string()),
    defaultUnit: v.string(),
    alternativeUnits: v.optional(v.array(v.string())),
    packageSize: v.optional(v.number()),
    packageUnit: v.optional(v.string()),
    averagePrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    nutritionPer100g: v.optional(commonValidators.nutrition),
    storageInstructions: v.optional(v.string()),
    defaultShelfLife: v.optional(v.number()),
  }),
  
  // Update product
  updateProduct: v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()),
    category: v.optional(commonValidators.allCategories),
    subcategory: v.optional(v.string()),
    defaultUnit: v.optional(v.string()),
    alternativeUnits: v.optional(v.array(v.string())),
    packageSize: v.optional(v.number()),
    packageUnit: v.optional(v.string()),
    averagePrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    nutritionPer100g: v.optional(commonValidators.nutrition),
    storageInstructions: v.optional(v.string()),
    defaultShelfLife: v.optional(v.number()),
  }),
  
  // Search products
  searchProducts: v.object({
    homeId: v.id("homes"),
    query: v.optional(v.string()),
    category: v.optional(commonValidators.allCategories),
    isAvailable: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  }),
};

// =============================================================================
// RECIPE VALIDATORS
// =============================================================================

export const recipeValidators = {
  // Recipe ingredient structure
  recipeIngredient: v.object({
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    preparation: v.optional(v.string()),
    notes: v.optional(v.string()),
    isOptional: v.optional(v.boolean()),
    group: v.optional(v.string()),
    order: v.number(),
    substitutions: v.optional(v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      unit: v.string(),
      notes: v.optional(v.string()),
    }))),
  }),
  
  // Create recipe
  createRecipe: v.object({
    homeId: v.id("homes"),
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.array(v.string()),
    servings: v.number(),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    totalTime: v.optional(v.number()),
    difficulty: v.optional(commonValidators.difficultyLevel),
    cuisine: v.optional(v.string()),
    mealType: v.optional(v.array(commonValidators.recipeMealType)),
    dietaryTags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    ingredients: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      unit: v.string(),
      preparation: v.optional(v.string()),
      notes: v.optional(v.string()),
      isOptional: v.optional(v.boolean()),
      group: v.optional(v.string()),
      order: v.number(),
    })),
  }),
  
  // Update recipe
  updateRecipe: v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.array(v.string())),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    totalTime: v.optional(v.number()),
    difficulty: v.optional(commonValidators.difficultyLevel),
    cuisine: v.optional(v.string()),
    mealType: v.optional(v.array(commonValidators.recipeMealType)),
    dietaryTags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
  }),
  
  // Add/update recipe ingredient
  upsertRecipeIngredient: v.object({
    recipeId: v.id("recipes"),
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    preparation: v.optional(v.string()),
    notes: v.optional(v.string()),
    isOptional: v.optional(v.boolean()),
    group: v.optional(v.string()),
    order: v.number(),
    substitutions: v.optional(v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      unit: v.string(),
      notes: v.optional(v.string()),
    }))),
  }),
  
  // Search recipes
  searchRecipes: v.object({
    homeId: v.id("homes"),
    query: v.optional(v.string()),
    mealType: v.optional(commonValidators.recipeMealType),
    difficulty: v.optional(commonValidators.difficultyLevel),
    cuisine: v.optional(v.string()),
    dietaryTags: v.optional(v.array(v.string())),
    maxPrepTime: v.optional(v.number()),
    maxCookTime: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  }),
};

// =============================================================================
// INVENTORY VALIDATORS
// =============================================================================

export const inventoryValidators = {
  // Create/update inventory item
  upsertInventory: v.object({
    homeId: v.id("homes"),
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    minQuantity: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    location: v.optional(v.string()),
    shelf: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    batchNumber: v.optional(v.string()),
    cost: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  }),
  
  // Update inventory quantity (quick update)
  updateQuantity: v.object({
    inventoryId: v.id("inventory"),
    quantity: v.number(),
    notes: v.optional(v.string()),
  }),
  
  // Consume from inventory
  consumeInventory: v.object({
    inventoryId: v.id("inventory"),
    quantityUsed: v.number(),
    notes: v.optional(v.string()),
  }),
  
  // Get low stock items
  getLowStock: v.object({
    homeId: v.id("homes"),
    limit: v.optional(v.number()),
  }),
  
  // Get expiring items
  getExpiring: v.object({
    homeId: v.id("homes"),
    daysAhead: v.optional(v.number()),
    limit: v.optional(v.number()),
  }),
};

// =============================================================================
// MENU VALIDATORS
// =============================================================================

export const menuValidators = {
  // Create menu
  createMenu: v.object({
    homeId: v.id("homes"),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    servings: v.number(),
    notes: v.optional(v.string()),
  }),
  
  // Update menu
  updateMenu: v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    servings: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(commonValidators.menuStatus),
  }),
  
  // Add recipe to menu
  addRecipeToMenu: v.object({
    menuId: v.id("menus"),
    recipeId: v.id("recipes"),
    date: v.number(),
    mealType: commonValidators.mealType,
    servings: v.number(),
    scaleFactor: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
  
  // Update menu recipe
  updateMenuRecipe: v.object({
    menuRecipeId: v.id("menuRecipes"),
    date: v.optional(v.number()),
    mealType: v.optional(commonValidators.mealType),
    servings: v.optional(v.number()),
    scaleFactor: v.optional(v.number()),
    status: v.optional(commonValidators.menuRecipeStatus),
    notes: v.optional(v.string()),
    actualServings: v.optional(v.number()),
  }),
  
  // Get menu for date range
  getMenuForPeriod: v.object({
    homeId: v.id("homes"),
    startDate: v.number(),
    endDate: v.number(),
  }),
};

// =============================================================================
// SHOPPING LIST VALIDATORS
// =============================================================================

export const shoppingListValidators = {
  // Create shopping list
  createShoppingList: v.object({
    homeId: v.id("homes"),
    name: v.string(),
    description: v.optional(v.string()),
    menuId: v.optional(v.id("menus")),
    generatedFromInventory: v.optional(v.boolean()),
    includeMinQuantities: v.optional(v.boolean()),
    targetDate: v.optional(v.number()),
    store: v.optional(v.string()),
    storeLocation: v.optional(v.string()),
  }),
  
  // Update shopping list
  updateShoppingList: v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    currency: v.optional(v.string()),
    store: v.optional(v.string()),
    storeLocation: v.optional(v.string()),
    status: v.optional(commonValidators.shoppingListStatus),
  }),
  
  // Add item to shopping list
  addItemToList: v.object({
    shoppingListId: v.id("shoppingLists"),
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    estimatedPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(commonValidators.priority),
    notes: v.optional(v.string()),
  }),
  
  // Update shopping list item
  updateShoppingListItem: v.object({
    itemId: v.id("shoppingListItems"),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    estimatedPrice: v.optional(v.number()),
    actualPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    status: v.optional(commonValidators.shoppingListItemStatus),
    purchasedQuantity: v.optional(v.number()),
    purchasedUnit: v.optional(v.string()),
    substitutedProductId: v.optional(v.id("products")),
    substitutedQuantity: v.optional(v.number()),
    substitutedUnit: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(commonValidators.priority),
    notes: v.optional(v.string()),
  }),
  
  // Mark item as purchased
  markItemPurchased: v.object({
    itemId: v.id("shoppingListItems"),
    purchasedQuantity: v.number(),
    purchasedUnit: v.string(),
    actualPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
  }),
  
  // Generate shopping list from menu
  generateFromMenu: v.object({
    homeId: v.id("homes"),
    menuId: v.id("menus"),
    name: v.string(),
    considerInventory: v.optional(v.boolean()),
    includeMinQuantities: v.optional(v.boolean()),
    targetDate: v.optional(v.number()),
  }),
};

// =============================================================================
// QUERY VALIDATORS
// =============================================================================

export const queryValidators = {
  // Pagination
  pagination: v.object({
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  }),
  
  // Home access validation
  homeAccess: v.object({
    homeId: v.id("homes"),
  }),
  
  // User access validation
  userAccess: v.object({
    userId: v.id("users"),
  }),
  
  // Date range queries
  dateRange: v.object({
    startDate: v.number(),
    endDate: v.number(),
  }),
  
  // Generic ID lookup
  idLookup: v.object({
    id: v.string(), // Generic ID that will be validated as specific type in mutation
  }),
  
  // Bulk operations
  bulkIds: v.object({
    ids: v.array(v.string()),
  }),
};
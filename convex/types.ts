// Note: This import will be available after running `npx convex dev` to generate types
// import { Doc, Id } from "./_generated/dataModel";

// For now, we'll define the types manually until Convex generates them
export type Doc<TableName extends string> = {
  _id: Id<TableName>;
  _creationTime: number;
  [key: string]: any;
};

export type Id<TableName extends string> = string & { __tableName: TableName };

/**
 * TypeScript Type Definitions for Recipe Management Application
 * 
 * This file provides comprehensive TypeScript types for:
 * - Database entities with proper relationships
 * - API input/output types
 * - Business logic types
 * - Utility types for type safety
 */

// =============================================================================
// BASE DATABASE TYPES
// =============================================================================

export type User = Doc<"users">;
export type Home = Doc<"homes">;
export type UserHome = Doc<"userHomes">;
export type Product = Doc<"products">;
export type Recipe = Doc<"recipes">;
export type RecipeIngredient = Doc<"recipeIngredients">;
export type Inventory = Doc<"inventory">;
export type Menu = Doc<"menus">;
export type MenuRecipe = Doc<"menuRecipes">;
export type ShoppingList = Doc<"shoppingLists">;
export type ShoppingListItem = Doc<"shoppingListItems">;

// =============================================================================
// ID TYPES
// =============================================================================

export type UserId = Id<"users">;
export type HomeId = Id<"homes">;
export type UserHomeId = Id<"userHomes">;
export type ProductId = Id<"products">;
export type RecipeId = Id<"recipes">;
export type RecipeIngredientId = Id<"recipeIngredients">;
export type InventoryId = Id<"inventory">;
export type MenuId = Id<"menus">;
export type MenuRecipeId = Id<"menuRecipes">;
export type ShoppingListId = Id<"shoppingLists">;
export type ShoppingListItemId = Id<"shoppingListItems">;

// =============================================================================
// ENUM TYPES
// =============================================================================

export type UnitSystem = "metric" | "imperial";

export type FoodCategory = 
  | "vegetables"
  | "fruits" 
  | "meat"
  | "fish"
  | "dairy"
  | "grains"
  | "spices"
  | "beverages"
  | "snacks";

export type NonFoodCategory = 
  | "cleaning"
  | "hygiene"
  | "household"
  | "pet-care"
  | "health";

export type ProductCategory = FoodCategory | NonFoodCategory;

export type UserRole = "owner" | "member";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type RecipeMealType = MealType | "dessert" | "appetizer";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type UserHomeStatus = "active" | "invited" | "inactive";

export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock" | "expired";

export type MenuStatus = "draft" | "active" | "completed" | "archived";

export type MenuRecipeStatus = "planned" | "prepared" | "completed" | "skipped";

export type ShoppingListStatus = "draft" | "active" | "completed" | "cancelled";

export type ShoppingListItemStatus = "pending" | "purchased" | "unavailable" | "substituted" | "skipped";

export type Priority = "low" | "medium" | "high";

// =============================================================================
// NUTRITIONAL TYPES
// =============================================================================

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// =============================================================================
// EXTENDED TYPES WITH RELATIONSHIPS
// =============================================================================

/**
 * User with their homes and roles
 */
export interface UserWithHomes extends User {
  homes: Array<{
    userHome: UserHome;
    home: Home;
  }>;
}

/**
 * Home with all members and their roles
 */
export interface HomeWithMembers extends Home {
  members: Array<{
    userHome: UserHome;
    user: User;
  }>;
}

/**
 * Product with inventory information for a specific home
 */
export interface ProductWithInventory extends Product {
  inventory?: Inventory;
  currentStock?: {
    quantity: number;
    unit: string;
    status: InventoryStatus;
    location?: string;
    expirationDate?: number;
  };
}

/**
 * Recipe with all ingredients and their details
 */
export interface RecipeWithIngredients extends Recipe {
  ingredients: Array<{
    ingredient: RecipeIngredient;
    product: Product;
  }>;
  totalIngredients: number;
  availableIngredients?: number; // Based on current inventory
}

/**
 * Recipe ingredient with product details
 */
export interface RecipeIngredientWithProduct extends RecipeIngredient {
  product: Product;
}

/**
 * Inventory item with product details
 */
export interface InventoryWithProduct extends Inventory {
  product: Product;
}

/**
 * Menu with all recipes for the period
 */
export interface MenuWithRecipes extends Menu {
  recipes: Array<{
    menuRecipe: MenuRecipe;
    recipe: RecipeWithIngredients;
  }>;
  totalRecipes: number;
  totalMeals: number;
}

/**
 * Menu recipe with full recipe details
 */
export interface MenuRecipeWithDetails extends MenuRecipe {
  recipe: RecipeWithIngredients;
}

/**
 * Shopping list with all items and their details
 */
export interface ShoppingListWithItems extends ShoppingList {
  items: Array<{
    item: ShoppingListItem;
    product: Product;
    substitutedProduct?: Product;
  }>;
  totalItems: number;
  purchasedItems: number;
  totalEstimatedCost?: number;
  totalActualCost?: number;
  completionPercentage: number;
}

/**
 * Shopping list item with product details
 */
export interface ShoppingListItemWithProduct extends ShoppingListItem {
  product: Product;
  substitutedProduct?: Product;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Common response wrapper with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  avatar?: string;
  preferredUnits?: UnitSystem;
  language?: string;
  timezone?: string;
}

/**
 * Home creation request
 */
export interface CreateHomeRequest {
  name: string;
  description?: string;
  defaultUnits: UnitSystem;
  currency: string;
  country?: string;
}

/**
 * Product creation request
 */
export interface CreateProductRequest {
  homeId: HomeId;
  name: string;
  description?: string;
  brand?: string;
  barcode?: string;
  category: ProductCategory;
  subcategory?: string;
  defaultUnit: string;
  alternativeUnits?: string[];
  packageSize?: number;
  packageUnit?: string;
  averagePrice?: number;
  currency?: string;
  nutritionPer100g?: NutritionalInfo;
  storageInstructions?: string;
  defaultShelfLife?: number;
}

/**
 * Recipe ingredient input
 */
export interface RecipeIngredientInput {
  productId: ProductId;
  quantity: number;
  unit: string;
  preparation?: string;
  notes?: string;
  isOptional?: boolean;
  group?: string;
  order: number;
  substitutions?: Array<{
    productId: ProductId;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

/**
 * Recipe creation request
 */
export interface CreateRecipeRequest {
  homeId: HomeId;
  name: string;
  description?: string;
  instructions: string[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: DifficultyLevel;
  cuisine?: string;
  mealType?: RecipeMealType[];
  dietaryTags?: string[];
  imageUrl?: string;
  videoUrl?: string;
  sourceUrl?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  ingredients: RecipeIngredientInput[];
}

/**
 * Inventory update request
 */
export interface InventoryUpdateRequest {
  homeId: HomeId;
  productId: ProductId;
  quantity: number;
  unit: string;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  shelf?: string;
  purchaseDate?: number;
  expirationDate?: number;
  batchNumber?: string;
  cost?: number;
  currency?: string;
  notes?: string;
}

/**
 * Menu creation request
 */
export interface CreateMenuRequest {
  homeId: HomeId;
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  servings: number;
  notes?: string;
}

/**
 * Shopping list creation request
 */
export interface CreateShoppingListRequest {
  homeId: HomeId;
  name: string;
  description?: string;
  menuId?: MenuId;
  generatedFromInventory?: boolean;
  includeMinQuantities?: boolean;
  targetDate?: number;
  store?: string;
  storeLocation?: string;
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

/**
 * Product search filters
 */
export interface ProductSearchFilters extends PaginationParams {
  homeId: HomeId;
  query?: string;
  category?: ProductCategory;
  isAvailable?: boolean;
  inStock?: boolean;
}

/**
 * Recipe search filters
 */
export interface RecipeSearchFilters extends PaginationParams {
  homeId: HomeId;
  query?: string;
  mealType?: RecipeMealType;
  difficulty?: DifficultyLevel;
  cuisine?: string;
  dietaryTags?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  isPublic?: boolean;
  isFavorite?: boolean;
  hasAllIngredients?: boolean; // Filter by ingredient availability
}

/**
 * Inventory search filters
 */
export interface InventorySearchFilters extends PaginationParams {
  homeId: HomeId;
  query?: string;
  category?: ProductCategory;
  status?: InventoryStatus;
  location?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  daysAhead?: number;
}

/**
 * Menu search filters
 */
export interface MenuSearchFilters extends PaginationParams {
  homeId: HomeId;
  status?: MenuStatus;
  startDate?: number;
  endDate?: number;
}

/**
 * Shopping list search filters
 */
export interface ShoppingListSearchFilters extends PaginationParams {
  homeId: HomeId;
  status?: ShoppingListStatus;
  targetDate?: number;
  store?: string;
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Recipe scaling calculation
 */
export interface RecipeScaling {
  originalServings: number;
  targetServings: number;
  scaleFactor: number;
  scaledIngredients: Array<{
    ingredient: RecipeIngredient;
    originalQuantity: number;
    scaledQuantity: number;
    unit: string;
  }>;
}

/**
 * Inventory consumption tracking
 */
export interface InventoryConsumption {
  inventoryId: InventoryId;
  productId: ProductId;
  quantityBefore: number;
  quantityConsumed: number;
  quantityAfter: number;
  unit: string;
  consumedAt: number;
  consumedBy: UserId;
  reason?: string; // e.g., "Recipe: Chicken Tikka Masala"
}

/**
 * Shopping list generation result
 */
export interface ShoppingListGeneration {
  menuId: MenuId;
  requiredItems: Array<{
    productId: ProductId;
    totalQuantityNeeded: number;
    unit: string;
    currentInventory?: number;
    quantityToBuy: number;
    recipes: Array<{
      recipeId: RecipeId;
      recipeName: string;
      quantity: number;
      servings: number;
    }>;
  }>;
  missingProducts: Array<{
    recipeName: string;
    ingredientDescription: string;
    suggestions?: ProductId[];
  }>;
  totalEstimatedCost?: number;
  currency?: string;
}

/**
 * Nutritional analysis for a recipe
 */
export interface RecipeNutritionalAnalysis {
  recipeId: RecipeId;
  totalNutrition: NutritionalInfo;
  nutritionPerServing: NutritionalInfo;
  ingredientBreakdown: Array<{
    ingredient: RecipeIngredient;
    product: Product;
    contribution: NutritionalInfo;
    percentage: number; // Percentage of total recipe nutrition
  }>;
}

/**
 * Menu nutritional analysis
 */
export interface MenuNutritionalAnalysis {
  menuId: MenuId;
  period: {
    startDate: number;
    endDate: number;
  };
  dailyNutrition: Array<{
    date: number;
    meals: Array<{
      mealType: MealType;
      recipes: Array<{
        recipe: Recipe;
        servings: number;
        nutrition: NutritionalInfo;
      }>;
      totalNutrition: NutritionalInfo;
    }>;
    totalNutrition: NutritionalInfo;
  }>;
  averageDailyNutrition: NutritionalInfo;
  totalNutrition: NutritionalInfo;
}

/**
 * Inventory status report
 */
export interface InventoryStatusReport {
  homeId: HomeId;
  totalProducts: number;
  totalValue?: number;
  currency?: string;
  statusBreakdown: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    expired: number;
  };
  categoryBreakdown: Array<{
    category: ProductCategory;
    count: number;
    value?: number;
  }>;
  expiringItems: Array<{
    inventory: Inventory;
    product: Product;
    daysUntilExpiry: number;
  }>;
  lowStockItems: Array<{
    inventory: Inventory;
    product: Product;
    currentQuantity: number;
    minQuantity: number;
  }>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Omit database-generated fields for creation
 */
export type CreateInput<T> = Omit<T, "_id" | "_creationTime" | "createdAt" | "updatedAt">;

/**
 * Make specific fields optional for updates
 */
export type UpdateInput<T, K extends keyof T = never> = Partial<Omit<T, "_id" | "_creationTime" | "createdAt" | K>>;

/**
 * Type for API responses with metadata
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

/**
 * Type for batch operations
 */
export interface BatchOperation<T> {
  operation: "create" | "update" | "delete";
  data: T;
  id?: string;
}

export interface BatchOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  operation: BatchOperation<T>;
}

/**
 * Type for user permissions in a home
 */
export interface UserPermissions {
  role: UserRole;
  canManageProducts: boolean;
  canManageRecipes: boolean;
  canManageInventory: boolean;
  canManageMenus: boolean;
  canManageShoppingLists: boolean;
  canManageUsers: boolean;
}

/**
 * Type for user session data
 */
export interface UserSession {
  userId: UserId;
  user: User;
  currentHomeId?: HomeId;
  homes: Array<{
    home: Home;
    permissions: UserPermissions;
    userHome: UserHome;
  }>;
}

/**
 * Type for unit conversion
 */
export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
  category: "weight" | "volume" | "length" | "count";
}

/**
 * Type for recipe suggestions based on available ingredients
 */
export interface RecipeSuggestion {
  recipe: RecipeWithIngredients;
  availableIngredients: number;
  totalIngredients: number;
  completionPercentage: number;
  missingIngredients: Array<{
    ingredient: RecipeIngredient;
    product: Product;
  }>;
  substitutableIngredients: Array<{
    ingredient: RecipeIngredient;
    product: Product;
    substitutions: Array<{
      product: Product;
      available: boolean;
    }>;
  }>;
}
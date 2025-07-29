import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema for Recipe Management Application
 * 
 * This schema implements the finalized MCD design with the following key features:
 * - Multi-user home/household management with roles
 * - Home-scoped product catalogs (no free-text ingredients)
 * - Recipe management with structured ingredients
 * - Inventory tracking with quantities and expiration dates
 * - Menu planning with flexible meal types
 * - Shopping list generation with status tracking
 * - Comprehensive user permissions and security
 */

export default defineSchema({
  /**
   * Users table - Authentication and profile management
   * Integrates with Convex Auth for user authentication
   */
  users: defineTable({
    // Basic user information
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()), // URL to profile image
    
    // Account status and timestamps
    isActive: v.boolean(),
    createdAt: v.number(), // Unix timestamp
    updatedAt: v.number(), // Unix timestamp
    lastLoginAt: v.optional(v.number()), // Unix timestamp
    
    // User preferences
    preferredUnits: v.optional(v.union(v.literal("metric"), v.literal("imperial"))),
    language: v.optional(v.string()), // ISO language code
    timezone: v.optional(v.string()), // IANA timezone identifier
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"])
    .index("by_created", ["createdAt"]),

  /**
   * Homes table - Household/family groups
   * Central entity that scopes products, recipes, and other data
   */
  homes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Home settings
    defaultUnits: v.union(v.literal("metric"), v.literal("imperial")),
    currency: v.string(), // ISO currency code (USD, EUR, etc.)
    country: v.optional(v.string()), // ISO country code
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Home status
    isActive: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"])
    .index("by_created", ["createdAt"]),

  /**
   * UserHomes table - Many-to-many relationship between users and homes
   * Supports multiple users per home and users belonging to multiple homes
   */
  userHomes: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    
    // Role-based access control
    role: v.union(v.literal("owner"), v.literal("member")),
    
    // Permissions (owners have all permissions by default)
    canManageProducts: v.boolean(), // Can add/edit/delete products
    canManageRecipes: v.boolean(),  // Can add/edit/delete recipes
    canManageInventory: v.boolean(), // Can update inventory
    canManageMenus: v.boolean(),    // Can create/edit menus
    canManageShoppingLists: v.boolean(), // Can create/edit shopping lists
    canManageUsers: v.boolean(),    // Can invite/remove users (owners only)
    
    // Timestamps
    joinedAt: v.number(),
    invitedAt: v.optional(v.number()),
    invitedBy: v.optional(v.id("users")),
    
    // Status
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("inactive")),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"])
    .index("by_user_home", ["userId", "homeId"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  /**
   * Products table - Home-scoped product catalog
   * All ingredients must be structured products (no free-text)
   */
  products: defineTable({
    homeId: v.id("homes"),
    
    // Product identification
    name: v.string(),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()), // EAN/UPC barcode
    
    // Categorization
    category: v.union(
      // Food categories
      v.literal("vegetables"),
      v.literal("fruits"),
      v.literal("meat"),
      v.literal("fish"),
      v.literal("dairy"),
      v.literal("grains"),
      v.literal("spices"),
      v.literal("beverages"),
      v.literal("snacks"),
      // Non-food categories
      v.literal("cleaning"),
      v.literal("hygiene"),
      v.literal("household"),
      v.literal("pet-care"),
      v.literal("health")
    ),
    subcategory: v.optional(v.string()), // Flexible subcategorization
    
    // Product specifications
    defaultUnit: v.string(), // Default unit for this product (kg, l, piece, etc.)
    alternativeUnits: v.optional(v.array(v.string())), // Alternative units
    packageSize: v.optional(v.number()), // Default package size
    packageUnit: v.optional(v.string()), // Unit for package size
    
    // Pricing and availability
    averagePrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    isAvailable: v.boolean(),
    
    // Nutritional information (optional)
    nutritionPer100g: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      fiber: v.optional(v.number()),
      sugar: v.optional(v.number()),
      sodium: v.optional(v.number()),
    })),
    
    // Storage information
    storageInstructions: v.optional(v.string()),
    defaultShelfLife: v.optional(v.number()), // Days
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_home", ["homeId"])
    .index("by_home_name", ["homeId", "name"])
    .index("by_home_category", ["homeId", "category"])
    .index("by_barcode", ["barcode"])
    .index("by_created_by", ["createdBy"])
    .index("by_active", ["isActive"]),

  /**
   * Recipes table - Recipe definitions with metadata
   */
  recipes: defineTable({
    homeId: v.id("homes"),
    
    // Basic recipe information
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.array(v.string()), // Step-by-step instructions
    
    // Recipe metadata
    servings: v.number(), // Number of servings this recipe makes
    prepTime: v.optional(v.number()), // Preparation time in minutes
    cookTime: v.optional(v.number()), // Cooking time in minutes
    totalTime: v.optional(v.number()), // Total time in minutes
    
    // Difficulty and tags
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
    cuisine: v.optional(v.string()), // e.g., "Italian", "Mexican", "Asian"
    mealType: v.optional(v.array(v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("dessert"),
      v.literal("appetizer")
    ))),
    dietaryTags: v.optional(v.array(v.string())), // e.g., "vegetarian", "vegan", "gluten-free"
    
    // Media and presentation
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()), // Original recipe source
    
    // Nutritional information (calculated from ingredients)
    nutritionPerServing: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      fiber: v.optional(v.number()),
      sugar: v.optional(v.number()),
      sodium: v.optional(v.number()),
    })),
    
    // Recipe status and sharing
    isPublic: v.boolean(), // Whether recipe can be shared between homes
    isActive: v.boolean(),
    isFavorite: v.boolean(),
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMadeAt: v.optional(v.number()),
    timesMade: v.number(), // Usage counter
  })
    .index("by_home", ["homeId"])
    .index("by_home_name", ["homeId", "name"])
    .index("by_created_by", ["createdBy"])
    .index("by_meal_type", ["mealType"])
    .index("by_public", ["isPublic"])
    .index("by_favorite", ["isFavorite"])
    .index("by_times_made", ["timesMade"]),

  /**
   * RecipeIngredients table - Junction table for recipe-product relationships
   * Defines what products are needed for each recipe and in what quantities
   */
  recipeIngredients: defineTable({
    recipeId: v.id("recipes"),
    productId: v.id("products"),
    
    // Quantity information
    quantity: v.number(), // Amount needed
    unit: v.string(), // Unit of measurement
    
    // Ingredient specifications
    preparation: v.optional(v.string()), // e.g., "diced", "chopped", "grated"
    notes: v.optional(v.string()), // Additional notes about this ingredient
    isOptional: v.boolean(), // Whether this ingredient is optional
    
    // Grouping and order
    group: v.optional(v.string()), // e.g., "For the sauce", "For garnish"
    order: v.number(), // Display order within the recipe
    
    // Alternative ingredients
    substitutions: v.optional(v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      unit: v.string(),
      notes: v.optional(v.string()),
    }))),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_product", ["productId"])
    .index("by_recipe_order", ["recipeId", "order"])
    .index("by_recipe_group", ["recipeId", "group"]),

  /**
   * Inventory table - Current home inventory with quantities and tracking
   */
  inventory: defineTable({
    homeId: v.id("homes"),
    productId: v.id("products"),
    
    // Quantity information
    quantity: v.number(), // Current quantity in stock
    unit: v.string(), // Unit of measurement
    minQuantity: v.optional(v.number()), // Minimum quantity threshold
    maxQuantity: v.optional(v.number()), // Maximum quantity to keep
    
    // Location and storage
    location: v.optional(v.string()), // e.g., "pantry", "fridge", "freezer"
    shelf: v.optional(v.string()), // Specific location within storage area
    
    // Purchase and expiration tracking
    purchaseDate: v.optional(v.number()), // When item was purchased
    expirationDate: v.optional(v.number()), // When item expires
    batchNumber: v.optional(v.string()), // For tracking specific batches
    
    // Cost tracking
    cost: v.optional(v.number()), // Cost of current stock
    currency: v.optional(v.string()),
    
    // Status and notes
    status: v.union(
      v.literal("in-stock"),
      v.literal("low-stock"),
      v.literal("out-of-stock"),
      v.literal("expired")
    ),
    notes: v.optional(v.string()),
    
    // Metadata
    lastUpdatedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_product", ["productId"])
    .index("by_home_product", ["homeId", "productId"])
    .index("by_status", ["status"])
    .index("by_expiration", ["expirationDate"])
    .index("by_location", ["location"])
    .index("by_low_stock", ["homeId", "status"]),

  /**
   * Menus table - Meal planning periods
   */
  menus: defineTable({
    homeId: v.id("homes"),
    
    // Menu identification
    name: v.string(),
    description: v.optional(v.string()),
    
    // Time period
    startDate: v.number(), // Unix timestamp for start of menu period
    endDate: v.number(),   // Unix timestamp for end of menu period
    
    // Menu settings
    servings: v.number(), // Default number of servings for this menu
    notes: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_home_date", ["homeId", "startDate"])
    .index("by_status", ["status"])
    .index("by_created_by", ["createdBy"])
    .index("by_date_range", ["startDate", "endDate"]),

  /**
   * MenuRecipes table - Junction table for menu-recipe relationships
   * Links recipes to specific meals in a menu
   */
  menuRecipes: defineTable({
    menuId: v.id("menus"),
    recipeId: v.id("recipes"),
    
    // Meal scheduling
    date: v.number(), // Unix timestamp for the specific date
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    
    // Serving information
    servings: v.number(), // Number of servings for this instance
    scaleFactor: v.number(), // Multiplier for recipe quantities (default: 1.0)
    
    // Status and notes
    status: v.union(
      v.literal("planned"),
      v.literal("prepared"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    notes: v.optional(v.string()),
    actualServings: v.optional(v.number()), // Actual servings made
    
    // Metadata
    addedBy: v.id("users"),
    addedAt: v.number(),
    preparedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_menu", ["menuId"])
    .index("by_recipe", ["recipeId"])
    .index("by_menu_date", ["menuId", "date"])
    .index("by_date_meal", ["date", "mealType"])
    .index("by_status", ["status"]),

  /**
   * ShoppingLists table - Generated or manual shopping lists
   */
  shoppingLists: defineTable({
    homeId: v.id("homes"),
    
    // List identification
    name: v.string(),
    description: v.optional(v.string()),
    
    // List source and generation
    menuId: v.optional(v.id("menus")), // If generated from a menu
    generatedFromInventory: v.boolean(), // Whether list considers current inventory
    includeMinQuantities: v.boolean(), // Whether to include min quantity restocking
    
    // Shopping information
    targetDate: v.optional(v.number()), // When shopping should be done
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    currency: v.optional(v.string()),
    
    // Store and location
    store: v.optional(v.string()),
    storeLocation: v.optional(v.string()),
    
    // Status and completion
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    completionPercentage: v.number(), // 0-100
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id("users")),
  })
    .index("by_home", ["homeId"])
    .index("by_menu", ["menuId"])
    .index("by_status", ["status"])
    .index("by_target_date", ["targetDate"])
    .index("by_created_by", ["createdBy"]),

  /**
   * ShoppingListItems table - Individual items in shopping lists
   */
  shoppingListItems: defineTable({
    shoppingListId: v.id("shoppingLists"),
    productId: v.id("products"),
    
    // Quantity information
    quantity: v.number(),
    unit: v.string(),
    
    // Purchase details
    estimatedPrice: v.optional(v.number()),
    actualPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    
    // Item status
    status: v.union(
      v.literal("pending"),
      v.literal("purchased"),
      v.literal("unavailable"),
      v.literal("substituted"),
      v.literal("skipped")
    ),
    
    // Purchase information
    purchasedQuantity: v.optional(v.number()),
    purchasedUnit: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    
    // Substitution information
    substitutedProductId: v.optional(v.id("products")),
    substitutedQuantity: v.optional(v.number()),
    substitutedUnit: v.optional(v.string()),
    
    // Organization
    category: v.optional(v.string()), // For organizing shopping list
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    notes: v.optional(v.string()),
    
    // Metadata
    addedBy: v.id("users"),
    addedAt: v.number(),
    updatedAt: v.number(),
    purchasedBy: v.optional(v.id("users")),
  })
    .index("by_shopping_list", ["shoppingListId"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_added_by", ["addedBy"]),
});
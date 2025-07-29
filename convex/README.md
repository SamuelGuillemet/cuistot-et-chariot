# Convex Schema and Validators Documentation

## Overview

This implementation provides a comprehensive Convex database schema and validators for a recipe and shopping list management application. The schema supports multi-user households, home-scoped product catalogs, recipe management, inventory tracking, menu planning, and shopping list generation.

## Schema Architecture

### Core Principles

1. **Home-Scoped Data**: Products, recipes, and inventory are scoped to individual homes/households
2. **Structured Ingredients**: No free-text ingredients - all recipe components must be structured products
3. **Multi-User Support**: Users can belong to multiple homes with different roles and permissions
4. **Type Safety**: Comprehensive TypeScript types for all entities and operations
5. **Business Logic Validation**: Extensive validation for data integrity and business rules

### Database Tables

#### User Management
- **users**: User profiles and authentication
- **homes**: Household/family groups
- **userHomes**: Many-to-many relationship with roles and permissions

#### Product Management
- **products**: Home-specific product catalog with categories and nutritional info
- **inventory**: Current stock levels, locations, and expiration tracking

#### Recipe Management
- **recipes**: Recipe definitions with metadata and instructions
- **recipeIngredients**: Junction table linking recipes to products with quantities

#### Menu Planning
- **menus**: Meal planning periods
- **menuRecipes**: Specific recipe assignments to meals and dates

#### Shopping Lists
- **shoppingLists**: Generated or manual shopping lists
- **shoppingListItems**: Individual items with purchase tracking

## Key Features

### 1. Flexible Units System
- String-based units for maximum flexibility
- Support for metric and imperial systems
- Common units: kg, g, l, ml, piece, bunch, cup, tbsp, tsp
- Future-proof for unit conversion features

### 2. Comprehensive Categories
**Food Categories:**
- vegetables, fruits, meat, fish, dairy, grains, spices, beverages, snacks

**Non-Food Categories:**
- cleaning, hygiene, household, pet-care, health

### 3. Role-Based Permissions
**User Roles:**
- **Owner**: Full access to all home features
- **Member**: Configurable permissions per feature

**Permissions:**
- Manage Products
- Manage Recipes
- Manage Inventory
- Manage Menus
- Manage Shopping Lists
- Manage Users (owners only)

### 4. Status Tracking
- Inventory status: in-stock, low-stock, out-of-stock, expired
- Menu status: draft, active, completed, archived
- Shopping list status: draft, active, completed, cancelled
- Item status: pending, purchased, unavailable, substituted, skipped

## File Structure

```
convex/
├── schema.ts          # Main database schema definition
├── validators.ts      # Comprehensive validation helpers
├── types.ts          # TypeScript type definitions
├── examples.ts       # Example mutations and queries
└── convex.config.ts  # Convex configuration
```

## Validation Framework

### Data Validation
- Required field validation
- Format validation (email, URLs, currency codes)
- Range validation (quantities > 0, proper dates)
- Length validation (names, descriptions)

### Business Logic Validation
- Unique constraints (email per user, product name per home)
- Relationship validation (user belongs to home)
- Permission validation (user can perform action)
- Inventory constraints (sufficient stock for consumption)

### Security Validation
- Home access control (users can only access their homes)
- Permission-based action validation
- Input sanitization (trim strings, normalize data)

## Usage Examples

### Creating a User and Home

```typescript
// Create a user
const userId = await createUser({
  email: "user@example.com",
  name: "John Doe",
  preferredUnits: "metric",
  language: "en",
  timezone: "America/New_York"
});

// Create a home
const homeId = await createHome({
  name: "The Smith Family",
  description: "Our family kitchen",
  defaultUnits: "metric",
  currency: "USD",
  country: "US",
  creatorUserId: userId
});
```

### Adding Products

```typescript
// Add a product to the home
const productId = await createProduct({
  homeId,
  name: "Organic Tomatoes",
  category: "vegetables",
  defaultUnit: "kg",
  alternativeUnits: ["g", "piece"],
  averagePrice: 4.99,
  currency: "USD",
  nutritionPer100g: {
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fat: 0.2
  },
  creatorUserId: userId
});
```

### Creating Recipes

```typescript
// Create a recipe with structured ingredients
const recipeId = await createRecipe({
  homeId,
  name: "Pasta with Tomato Sauce",
  description: "Simple and delicious pasta dish",
  instructions: [
    "Boil water and cook pasta",
    "Heat oil in pan",
    "Add tomatoes and cook",
    "Mix pasta with sauce"
  ],
  servings: 4,
  prepTime: 15,
  cookTime: 20,
  difficulty: "easy",
  mealType: ["lunch", "dinner"],
  ingredients: [
    {
      productId: pastaProductId,
      quantity: 400,
      unit: "g",
      order: 1
    },
    {
      productId: tomatoProductId,
      quantity: 500,
      unit: "g",
      preparation: "diced",
      order: 2
    }
  ]
});
```

## Performance Considerations

### Indexes
All tables include strategic indexes for common query patterns:
- User lookups by email
- Home membership queries
- Product searches by category
- Recipe filtering by meal type
- Inventory status queries
- Expiration date monitoring

### Query Optimization
- Compound indexes for multi-field queries
- Filtered queries for soft deletes (isActive flags)
- Pagination support for large datasets
- Selective field loading for performance

## Migration Strategy

### Phase 1: Core Schema
1. Deploy user, home, and userHome tables
2. Implement basic authentication flow
3. Add home creation and management

### Phase 2: Product Catalog
1. Deploy product table with categories
2. Implement product management CRUD operations
3. Add search and filtering capabilities

### Phase 3: Recipe Management
1. Deploy recipe and recipeIngredient tables
2. Implement recipe creation with validation
3. Add recipe search and suggestions

### Phase 4: Inventory & Planning
1. Deploy inventory, menu, and shopping list tables
2. Implement stock tracking and menu planning
3. Add shopping list generation

## Security Best Practices

### Data Access Control
- All operations validate user home membership
- Permission-based access to home features
- No cross-home data access (strict isolation)

### Input Validation
- Comprehensive server-side validation
- SQL injection prevention (Convex handles this)
- XSS prevention through proper sanitization

### Business Logic Security
- Quantity validation (prevent negative stocks)
- Price validation (prevent negative costs)
- Role validation (prevent privilege escalation)

## Future Enhancements

### Planned Features
1. **Unit Conversion**: Automatic conversion between units
2. **Recipe Scaling**: Dynamic ingredient scaling for different serving sizes
3. **Nutritional Analysis**: Automated nutrition calculation from ingredients
4. **Smart Shopping Lists**: AI-powered list generation and optimization
5. **Recipe Suggestions**: Recommendations based on available inventory
6. **Sharing**: Public recipe sharing between homes
7. **Mobile Optimization**: Barcode scanning and mobile-first design

### Extensibility Points
- Custom product categories per home
- User-defined dietary restrictions
- Integration with external recipe APIs
- Grocery store price integration
- Meal planning optimization algorithms

## Testing

The `examples.ts` file includes basic CRUD operations that serve as both examples and functionality tests. These operations validate:

- Schema integrity
- Validation rules
- Permission enforcement
- Relationship constraints
- Business logic compliance

To test the schema, run the example mutations and verify:
1. Data is inserted correctly
2. Validation errors are caught appropriately
3. Permissions are enforced
4. Relationships are maintained
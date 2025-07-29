# Convex Setup Guide

## Quick Start

1. **Initialize Convex**:
   ```bash
   npx convex dev
   ```
   This will:
   - Generate the `_generated` folder with types
   - Set up your Convex project
   - Start the development server

2. **Environment Setup**:
   ```bash
   # Copy the generated .env.local values to your environment
   # The `npx convex dev` command will provide the necessary environment variables
   ```

3. **Enable Example Functions** (Optional):
   After running `npx convex dev`, uncomment the code in `convex/examples.ts` to enable the example mutations and queries for testing.

## Files Created

- `convex/schema.ts` - Complete database schema with 11 tables
- `convex/validators.ts` - Comprehensive validation helpers
- `convex/types.ts` - TypeScript type definitions
- `convex/examples.ts` - Example mutations and queries (commented out)
- `convex/README.md` - Detailed documentation
- `convex.config.ts` - Convex configuration

## Schema Overview

The schema implements a complete recipe management system with:

### Core Tables
- **users** - User authentication and profiles
- **homes** - Household/family groups
- **userHomes** - User-home relationships with roles

### Product Management
- **products** - Home-scoped product catalog
- **inventory** - Stock tracking with quantities and expiration

### Recipe System
- **recipes** - Recipe definitions with metadata
- **recipeIngredients** - Recipe-product relationships

### Planning & Shopping
- **menus** - Meal planning periods
- **menuRecipes** - Menu-recipe assignments
- **shoppingLists** - Shopping list management
- **shoppingListItems** - Individual shopping items

## Key Features

✅ **Multi-user homes** with role-based permissions  
✅ **Home-scoped data** - no cross-home access  
✅ **Structured ingredients** - no free-text ingredients  
✅ **Comprehensive validation** - data integrity and business rules  
✅ **Type safety** - Full TypeScript support  
✅ **Flexible units** - String-based unit system  
✅ **Performance optimized** - Strategic indexes for common queries  

## Next Steps

1. Run `npx convex dev` to generate types
2. Uncomment `convex/examples.ts` for testing
3. Implement your frontend components using the provided types
4. Use the validators for form validation
5. Build your mutations and queries using the schema

## Integration

Add to your React components:
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Use the generated types
import type { User, Home, Product } from "../convex/types";
```
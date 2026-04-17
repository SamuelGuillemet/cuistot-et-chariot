import {
  CATEGORY_DISPLAY_NAMES,
  PRODUCT_UNITS,
  RECIPE_DIFFICULTY_DISPLAY_NAMES,
} from '@backend/types';
import { toolDefinition } from '@tanstack/ai';
import * as v from 'valibot';
import { CATEGORY_TRANSLATIONS } from '@/components/food-icons/icon-food-font-config';
import { typedEnum } from '@/utils/valibot';

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Attaches a description to a schema so @valibot/to-json-schema can pick it up */
function describe<T extends v.GenericSchema>(schema: T, description: string) {
  return v.pipe(schema, v.description(description));
}

// ─── Shared schemas ──────────────────────────────────────────────────────────

const UnitSchema = describe(
  typedEnum(PRODUCT_UNITS),
  'Unité de mesure pour les ingrédients',
);

const DifficultySchema = describe(
  typedEnum(RECIPE_DIFFICULTY_DISPLAY_NAMES),
  'Niveau de difficulté de la recette (easy, medium, hard)',
);

// Uses your existing typedEnum helper + CATEGORY_DISPLAY_NAMES keys
const CategorySchema = describe(
  typedEnum(CATEGORY_DISPLAY_NAMES),
  'Catégorie du produit (dairy, meat, fish, vegetables, fruits, grains, bakery, frozen, beverages, snacks, condiments, cleaning, personal-care, other, prepared-meals, desserts)',
);

// ─── get_icons ── server tool (returns available food icons) ─────────────────

export const GetIconsSchema = v.object({
  category: v.optional(
    describe(
      typedEnum(CATEGORY_TRANSLATIONS),
      'Filtrer par catégorie (optionnel). Valeurs possibles : fruits, vegetables, nuts, dairy, meat, seafood, desserts, beverages, grains, condiments, snacks, other',
    ),
  ),
});

export type GetIconsInput = v.InferInput<typeof GetIconsSchema>;

export const getIconsDef = toolDefinition({
  name: 'get_icons',
  description:
    "Retourne la liste des icônes d'ingrédients disponibles (id, nom, catégorie). Utilise cet outil pour choisir l'icône la plus pertinente pour chaque nouveau produit à créer.",
  inputSchema: GetIconsSchema,
});

// ─── get_products ── server tool (silent, no approval needed) ───────────────��

export const GetProductsSchema = v.object({});

export type GetProductsInput = v.InferInput<typeof GetProductsSchema>;

export const getProductsDef = toolDefinition({
  name: 'get_products',
  description:
    "Récupère la liste de tous les produits disponibles dans le foyer de l'utilisateur. Appelle cet outil pour connaître les ingrédients disponibles avant de proposer une recette.",
  inputSchema: GetProductsSchema,
});

// ─── create_recipe ── client tool with approval popup ────────────────────────

const InstructionStepSchema = v.object({
  order: describe(v.number(), "Numéro de l'étape (commence à 1)"),
  text: describe(v.string(), "Description de l'étape"),
});

const ExistingProductSchema = v.object({
  productId: describe(v.string(), 'ID du produit existant'),
  quantity: describe(v.pipe(v.number(), v.minValue(0)), 'Quantité nécessaire'),
  unit: UnitSchema,
});

const NewProductSchema = v.object({
  name: describe(v.string(), 'Nom du produit à créer'),
  category: CategorySchema,
  defaultUnit: describe(UnitSchema, 'Unité par défaut du produit'),
  icon: describe(v.string(), "Icône du produit (utilise 'default' si inconnu)"),
  quantity: describe(
    v.pipe(v.number(), v.minValue(0)),
    'Quantité nécessaire pour la recette',
  ),
  unit: describe(UnitSchema, 'Unité de mesure pour la recette'),
});

export const CreateRecipeSchema = v.object({
  name: describe(v.string(), 'Nom de la recette'),
  instructions: describe(
    v.array(InstructionStepSchema),
    'Liste ordonnée des étapes de préparation',
  ),
  servings: describe(v.pipe(v.number(), v.minValue(1)), 'Nombre de portions'),
  prepTime: describe(
    v.pipe(v.number(), v.minValue(0)),
    'Temps de préparation en minutes',
  ),
  cookTime: describe(
    v.pipe(v.number(), v.minValue(0)),
    'Temps de cuisson en minutes',
  ),
  difficulty: DifficultySchema,
  existingProducts: describe(
    v.array(ExistingProductSchema),
    'Ingrédients déjà présents dans le foyer (utilise les IDs retournés par get_products)',
  ),
  newProducts: describe(
    v.array(NewProductSchema),
    "Ingrédients qui n'existent pas encore dans le foyer et doivent être créés",
  ),
});

export type CreateRecipeInput = v.InferInput<typeof CreateRecipeSchema>;

export const createRecipeDef = toolDefinition({
  name: 'create_recipe',
  description:
    "Crée une recette avec ses ingrédients. Les produits existants sont référencés par ID, les nouveaux seront créés automatiquement. TOUJOURS appeler cet outil quand l'utilisateur confirme vouloir enregistrer la recette.",
  inputSchema: CreateRecipeSchema,
  needsApproval: true,
});

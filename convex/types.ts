export type Role = 'member' | 'admin';

export type Status = 'pending' | 'accepted' | 'banned';

export type ProductCategory =
  | 'dairy'
  | 'meat'
  | 'fish'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'bakery'
  | 'frozen'
  | 'beverages'
  | 'snacks'
  | 'condiments'
  | 'cleaning'
  | 'personal-care'
  | 'other'
  | 'prepared-meals'
  | 'desserts';

export const CATEGORY_DISPLAY_NAMES: Record<ProductCategory, string> = {
  dairy: 'Produits laitiers',
  meat: 'Viande',
  fish: 'Poisson',
  vegetables: 'Légumes',
  fruits: 'Fruits',
  grains: 'Céréales',
  bakery: 'Boulangerie',
  frozen: 'Surgelés',
  beverages: 'Boissons',
  snacks: 'Collations',
  condiments: 'Condiments',
  cleaning: 'Nettoyage',
  'personal-care': 'Hygiène',
  other: 'Autres',
  'prepared-meals': 'Plats préparés',
  desserts: 'Desserts',
} as const;

export type ProductUnit =
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'pieces'
  | 'pack'
  | 'bottle'
  | 'can'
  | 'box'
  | 'bag'
  | 'cup'
  | 'tablespoon'
  | 'teaspoon';

export const PRODUCT_UNITS: Record<ProductUnit, string> = {
  kg: 'Kilogramme (kg)',
  g: 'Gramme (g)',
  l: 'Litres (l)',
  ml: 'Millilitres (ml)',
  pieces: 'Pièces',
  pack: 'Paquet',
  bottle: 'Bouteille',
  can: 'Conserve',
  box: 'Boîte',
  bag: 'Sac',
  cup: 'Tasse',
  tablespoon: 'Cuillère à soupe',
  teaspoon: 'Cuillère à café',
};

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export const RECIPE_DIFFICULTY_DISPLAY_NAMES: Record<RecipeDifficulty, string> =
  {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  } as const;

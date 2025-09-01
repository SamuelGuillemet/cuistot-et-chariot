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
  | 'other';

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
  can: 'Boîte',
  box: 'Boîte',
  bag: 'Sac',
  cup: 'Tasse',
  tablespoon: 'Cuillère à soupe',
  teaspoon: 'Cuillère à café',
};

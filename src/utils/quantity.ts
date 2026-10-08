import type { ProductUnit } from '@backend/types';

const FRACTIONS = ['', '¼', '½', '¾'];

/** Singular and plural label shown next to a quantity; `null` plural means invariable. */
const UNIT_LABELS: Record<ProductUnit, [singular: string, plural: string | null]> = {
  kg: ['kg', null],
  g: ['g', null],
  l: ['l', null],
  ml: ['ml', null],
  pieces: ['pièce', 'pièces'],
  pack: ['paquet', 'paquets'],
  bottle: ['bouteille', 'bouteilles'],
  can: ['conserve', 'conserves'],
  box: ['boîte', 'boîtes'],
  bag: ['sac', 'sacs'],
  cup: ['tasse', 'tasses'],
  tablespoon: ['c. à soupe', null],
  teaspoon: ['c. à café', null],
};

/** Exact value with at most two decimals, e.g. `1,25`. */
export function formatDecimal(value: number): string {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

/** Quantity rounded to something a cook can measure: whole g/ml, quarters for countable units. */
export function formatScaledQuantity(value: number, unit: ProductUnit): string {
  if (unit === 'g' || unit === 'ml') return Math.round(value).toLocaleString('fr-FR');
  if (unit === 'kg' || unit === 'l') return formatDecimal(value);
  const quarters = Math.round(value * 4);
  if (quarters === 0) return formatDecimal(value);
  const whole = Math.floor(quarters / 4);
  return `${whole || ''}${FRACTIONS[quarters % 4]}`;
}

export function formatUnit(unit: ProductUnit, quantity: number): string {
  const [singular, plural] = UNIT_LABELS[unit];
  return quantity >= 2 && plural ? plural : singular;
}

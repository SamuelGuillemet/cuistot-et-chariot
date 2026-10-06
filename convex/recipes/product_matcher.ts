import type { Doc } from '../_generated/dataModel';
import type { ProductUnit } from '../types';
import type { MarmitonRecipe, ParsedIngredient } from './marmiton';

type Product = Pick<Doc<'products'>, '_id' | 'name' | 'defaultUnit'>;

const MAX_CANDIDATES = 5;
const MIN_SCORE = 0.25;

export function matchRecipeProducts(recipe: MarmitonRecipe, products: readonly Product[]) {
  const match = createProductMatcher(products);
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      productIds: match(ingredient).map(({ product }) => product._id),
    })),
  };
}

export type MatchedMarmitonRecipe = ReturnType<typeof matchRecipeProducts>;

const preparationWords = new Set(
  [
    'coup',
    'decoup',
    'hach',
    'cisel',
    'eminc',
    'ecras',
    'rap',
    'pel',
    'epluch',
    'denoyaut',
    'egoutt',
    'rinc',
    'lav',
  ].flatMap((stem) => ['e', 'ee', 'es', 'ees'].map((ending) => stem + ending)),
);
const lowInformationWords = new Set(
  'd de du des la le les un une en a au aux pour avec dans et ou quelques environ'.split(' '),
);
const irregularForms: Record<string, string> = {
  oeufs: 'oeuf',
  yeux: 'oeil',
  chevaux: 'cheval',
  bocaux: 'bocal',
  morceaux: 'morceau',
  noyaux: 'noyau',
  poireaux: 'poireau',
  choux: 'chou',
  noix: 'noix',
  riz: 'riz',
  mais: 'mais',
  pois: 'pois',
};
const unitFamilies: ProductUnit[][] = [
  ['g', 'kg'],
  ['ml', 'l', 'cup', 'tablespoon', 'teaspoon'],
  ['pieces', 'pack', 'bottle', 'can', 'box', 'bag'],
];

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/\u0153/g, 'oe')
    .replace(/[\u2019'`\u00b4\-_/()[\]{},.;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function singularizeWord(word: string): string {
  if (irregularForms[word]) return irregularForms[word];
  if (word.length <= 3) return word;
  if (word.endsWith('aux') && word.length > 5) return `${word.slice(0, -3)}al`;
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  if (word.endsWith('x') && !word.endsWith('aux')) return word.slice(0, -1);
  return word;
}
function singularize(name: string): string {
  return name.split(' ').map(singularizeWord).join(' ');
}
function tokenize(name: string): Set<string> {
  return new Set(
    name
      .split(' ')
      .filter((word) => word && !lowInformationWords.has(word))
      .map(singularizeWord),
  );
}
function containsExpression(container: string, expression: string): boolean {
  return Boolean(container && expression && ` ${container} `.includes(` ${expression} `));
}
function levenshteinDistance(left: string, right: string): number {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + Number(left[leftIndex - 1] !== right[rightIndex - 1]),
      );
    }
    previous = current;
  }
  return previous[right.length];
}
function isProbableTypo(left: string, right: string): boolean {
  if (Math.min(left.length, right.length) < 5) return false;
  const maximumDistance = Math.max(left.length, right.length) <= 6 ? 1 : 2;
  return (
    Math.abs(left.length - right.length) <= maximumDistance &&
    levenshteinDistance(left, right) <= maximumDistance
  );
}
function unitBonus(ingredient: ProductUnit | null, product: ProductUnit): number {
  if (!ingredient) return 0;
  if (ingredient === product) return 0.03;
  return unitFamilies.some((family) => family.includes(ingredient) && family.includes(product))
    ? 0.02
    : 0;
}

/** Returns a function ranking catalog products for an ingredient, best match first. */
export function createProductMatcher(products: readonly Product[]) {
  const catalog = products.flatMap((product) => {
    const name = normalizeName(product.name);
    const tokens = tokenize(name);
    return tokens.size ? [{ product, name, singular: singularize(name), tokens }] : [];
  });

  return (ingredient: Pick<ParsedIngredient, 'name' | 'unit'>) => {
    const name = normalizeName(ingredient.name);
    const simplified = name
      .split(' ')
      .filter((word) => !preparationWords.has(word))
      .join(' ');
    const singular = singularize(simplified);
    const tokens = tokenize(simplified);
    if (!tokens.size) return [];

    const candidates: { product: Product; score: number }[] = [];
    for (const entry of catalog) {
      const ingredientContains = containsExpression(singular, entry.singular);
      const productContains = containsExpression(entry.singular, singular);
      const sharedTokens = [...tokens].filter((token) => entry.tokens.has(token)).length;
      const similarity =
        1 -
        levenshteinDistance(singular, entry.singular) /
          Math.max(singular.length, entry.singular.length);
      const isTypo =
        similarity >= 0.65 &&
        [...tokens].some((token) =>
          [...entry.tokens].some((other) => isProbableTypo(token, other)),
        );
      if (!ingredientContains && !productContains && !sharedTokens && !isTypo) continue;

      let exactScore = 0;
      if (name === entry.name || simplified === entry.name) exactScore = 1;
      else if (singular === entry.singular) exactScore = 0.98;

      let containmentScore = 0;
      if (ingredientContains) {
        containmentScore = Math.min(0.97, 0.86 + (entry.singular.length / singular.length) * 0.11);
      } else if (productContains) {
        containmentScore = Math.min(0.78, 0.66 + (singular.length / entry.singular.length) * 0.12);
      }

      const tokenScore =
        (sharedTokens / tokens.size) * 0.7 + (sharedTokens / entry.tokens.size) * 0.3;
      const score = Math.min(
        1,
        Math.max(exactScore, containmentScore, tokenScore * 0.9, similarity * 0.65) +
          unitBonus(ingredient.unit, entry.product.defaultUnit),
      );
      if (score >= MIN_SCORE) candidates.push({ product: entry.product, score });
    }

    return candidates
      .sort(
        (left, right) =>
          right.score - left.score || left.product.name.localeCompare(right.product.name, 'fr'),
      )
      .slice(0, MAX_CANDIDATES);
  };
}

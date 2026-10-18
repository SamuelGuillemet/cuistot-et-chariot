import { parse } from 'node-html-parser';
import type { ProductUnit, RecipeDifficulty } from '../types';

export interface ParsedIngredient {
  quantity: number | null;
  unit: ProductUnit | null;
  name: string;
}

export interface MarmitonRecipe {
  name: string;
  difficulty: RecipeDifficulty;
  people: number;
  ingredients: ParsedIngredient[];
  prepTime: number;
  cookTime: number;
  steps: string[];
}

export interface MarmitonSearchResult {
  name: string;
  url: string;
}

const BASE_URL = 'https://www.marmiton.org';
const units: [ProductUnit, string, number][] = [
  ['tablespoon', String.raw`cuilleres? a soupe|cuillers? a soupe|c\.?\s*a\s*soupe|cas`, 1],
  ['teaspoon', String.raw`cuilleres? a cafe|cuillers? a cafe|c\.?\s*a\s*cafe|cac`, 1],
  ['kg', 'kilogrammes?|kgs?', 1],
  ['g', 'grammes?|gr|g', 1],
  ['ml', 'millilitres?|ml', 1],
  ['ml', 'centilitres?|cl', 10],
  ['ml', 'decilitres?|dl', 100],
  ['l', 'litres?|l', 1],
  ['pack', 'paquets?', 1],
  ['bag', 'sachets?|sacs?', 1],
  ['bottle', 'bouteilles?', 1],
  ['can', 'conserves?', 1],
  ['box', 'boites?', 1],
  ['cup', 'tasses?', 1],
  ['pieces', 'pieces?', 1],
];
const fractions: Record<string, number> = {
  '\u00bc': 1 / 4,
  '\u00bd': 1 / 2,
  '\u00be': 3 / 4,
  '\u2150': 1 / 7,
  '\u2151': 1 / 9,
  '\u2152': 1 / 10,
  '\u2153': 1 / 3,
  '\u2154': 2 / 3,
  '\u2155': 1 / 5,
  '\u2156': 2 / 5,
  '\u2157': 3 / 5,
  '\u2158': 4 / 5,
  '\u2159': 1 / 6,
  '\u215a': 5 / 6,
  '\u215b': 1 / 8,
  '\u215c': 3 / 8,
  '\u215d': 5 / 8,
  '\u215e': 7 / 8,
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function parseIngredient(line: string): ParsedIngredient {
  const cleaned = line
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  const input = cleaned.replace(
    /^(?:environ|approximativement|\u00e0 peu pr\u00e8s|presque)\s+/i,
    '',
  );
  const fractionMatch = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)/.exec(input);
  const numberMatch = /^(\d+(?:[.,]\d+)?)(?:\s*([\u00bc-\u00be\u2150-\u215e]))?/.exec(input);
  const unicodeMatch = /^([\u00bc-\u00be\u2150-\u215e])/.exec(input);
  const match = fractionMatch ?? numberMatch ?? unicodeMatch;
  if (!match) return { quantity: null, unit: null, name: cleaned };
  let quantity = fractions[unicodeMatch?.[1] ?? ''] ?? 0;
  if (fractionMatch) {
    quantity = Number(fractionMatch[1] ?? 0) + Number(fractionMatch[2]) / Number(fractionMatch[3]);
  } else if (numberMatch) {
    quantity = Number(numberMatch[1].replace(',', '.')) + (fractions[numberMatch[2]] ?? 0);
  }
  if (!Number.isFinite(quantity)) return { quantity: null, unit: null, name: cleaned };

  let name = input.slice(match[0].length).trim();
  let unit: ProductUnit = 'pieces';
  let multiplier = 1;
  const normalizedName = normalize(name);
  for (const [candidate, aliases, conversion] of units) {
    const unitMatch = new RegExp(String.raw`^(?:${aliases})(?=\s|$)`).exec(normalizedName);
    if (!unitMatch) continue;
    unit = candidate;
    multiplier = conversion;
    name = name.slice(unitMatch[0].length).trim();
    break;
  }
  name = name
    .replace(/^(?:de la |de l'|du |des |de |d')/i, '')
    .replace(/[\s.,;:]+$/, '')
    .trim();
  return { quantity: Math.round(quantity * multiplier * 1e6) / 1e6, unit, name };
}

/** Drops the SEO suffix Marmiton appends to page titles, e.g. "Lasagnes : la meilleure recette". */
export function cleanRecipeName(name: string): string {
  const cleaned = name
    .replace(/\s*:\s*(?:la |notre |les )?meilleures? recettes?\b.*$/i, '')
    .replace(/\s*:\s*d[ée]couvrez\b.*$/i, '')
    .trim();
  return cleaned || name;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function findRecipe(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const recipe = findRecipe(item);
      if (recipe) return recipe;
    }
    return null;
  }
  const data = record(value);
  if (!data) return null;
  const types = Array.isArray(data['@type']) ? data['@type'] : [data['@type']];
  if (types.includes('Recipe') || types.includes('MarmitonRecipe')) return data;
  return findRecipe(data['@graph']);
}

/** ISO 8601 duration (e.g. `PT1H15M`) to whole minutes; 0 when missing or malformed. */
function minutes(value: unknown): number {
  const number = String.raw`(\d+(?:\.\d+)?)`;
  const match =
    typeof value === 'string' &&
    new RegExp(`^P(?:${number}D)?(?:T(?:${number}H)?(?:${number}M)?(?:${number}S)?)?$`).exec(value);
  if (!match) return 0;
  const [days, hours, mins, seconds] = match.slice(1).map((part) => Number(part ?? 0));
  return Math.round(days * 1440 + hours * 60 + mins + seconds / 60);
}

function steps(value: unknown): string[] {
  if (typeof value === 'string') return [parse(value).text.trim()].filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(steps);
  const data = record(value);
  return data ? steps(data.itemListElement ?? data.text) : [];
}

export function parseMarmitonRecipe(html: string): MarmitonRecipe | null {
  const root = parse(html);
  let recipe: Record<string, unknown> | null = null;
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      recipe = findRecipe(JSON.parse(script.text));
    } catch {
      continue;
    }
    if (recipe) break;
  }
  if (!recipe) return null;
  if (
    typeof recipe.name !== 'string' ||
    !recipe.name.trim() ||
    !Array.isArray(recipe.recipeIngredient) ||
    !recipe.recipeIngredient.every((item) => typeof item === 'string')
  ) {
    throw new Error('Invalid Marmiton recipe data for name or ingredients');
  }
  const instructions = steps(recipe.recipeInstructions);
  const yieldValue = Array.isArray(recipe.recipeYield) ? recipe.recipeYield[0] : recipe.recipeYield;
  const yieldText =
    typeof yieldValue === 'string' || typeof yieldValue === 'number' ? String(yieldValue) : '';
  const people = Number(/\d+/.exec(yieldText)?.[0]);
  const keywordText = Array.isArray(recipe.keywords)
    ? recipe.keywords.filter((keyword) => typeof keyword === 'string').join(',')
    : recipe.keywords;
  const keywords = normalize(typeof keywordText === 'string' ? keywordText : '');
  let difficulty: RecipeDifficulty = 'medium';
  if (/\bdifficile\b/.test(keywords)) difficulty = 'hard';
  else if (/\bfacile\b/.test(keywords)) difficulty = 'easy';
  return {
    name: cleanRecipeName(parse(recipe.name).text.trim()),
    difficulty,
    people,
    ingredients: recipe.recipeIngredient.filter((line) => line.trim()).map(parseIngredient),
    prepTime: minutes(recipe.prepTime),
    cookTime: minutes(recipe.cookTime),
    steps: instructions,
  };
}

function recipeUrl(value: string): URL {
  const url = new URL(value, BASE_URL);
  if (url.origin !== BASE_URL || !url.pathname.startsWith('/recettes/recette_')) {
    throw new Error('Invalid Marmiton recipe URL');
  }
  return url;
}

export async function searchMarmitonRecipes(
  query: string,
  fetchPage: typeof fetch = fetch,
): Promise<MarmitonSearchResult[]> {
  const text = query.trim();
  if (!text || text.length > 200)
    throw new Error('Search must contain between 1 and 200 characters');
  const searchUrl = new URL('/recettes/recherche.aspx', BASE_URL);
  searchUrl.searchParams.set('aqt', text);
  searchUrl.searchParams.set('page', '1');
  const response = await fetchPage(searchUrl, {
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`Marmiton request failed (${response.status})`);
  const search = parse(await response.text());
  const results: MarmitonSearchResult[] = [];
  const seen = new Set<string>();
  for (const anchor of search.querySelectorAll(
    'ul.search-list li.search-list__item a.card-content__title',
  )) {
    const href = anchor.getAttribute('href');
    const name = cleanRecipeName(parse(anchor.text).text.trim());
    if (!href || !name) continue;
    const url = recipeUrl(href).toString();
    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ name, url });
  }
  return results;
}

export async function getMarmitonRecipe(
  url: string,
  fetchPage: typeof fetch = fetch,
): Promise<MarmitonRecipe> {
  const recipeUrlValue = recipeUrl(url);
  const response = await fetchPage(recipeUrlValue, {
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`Marmiton request failed (${response.status})`);
  const recipe = parseMarmitonRecipe(await response.text());
  if (!recipe) throw new Error('Marmiton recipe structured data not found');
  return recipe;
}

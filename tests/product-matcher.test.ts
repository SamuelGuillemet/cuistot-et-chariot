import { Id } from '@api/dataModel';
import { MarmitonRecipe } from '@backend/recipes/marmiton';
import { ProductUnit } from '@backend/types';
import { test, expect } from 'vite-plus/test';
import { createProductMatcher, matchRecipeProducts } from '../convex/recipes/product_matcher';

const products = [
  { _id: 'flour', name: 'Farine', defaultUnit: 'kg' },
  { _id: 'egg', name: 'Oeuf', defaultUnit: 'pieces' },
  { _id: 'cream', name: 'Cr\u00e8me fra\u00eeche', defaultUnit: 'ml' },
  { _id: 'oil', name: 'Huile', defaultUnit: 'l' },
  { _id: 'sesame-oil', name: 'Huile de s\u00e9same', defaultUnit: 'l' },
  { _id: 'salmon', name: 'Saumon', defaultUnit: 'g' },
  { _id: 'smoked-salmon', name: 'Saumon fum\u00e9', defaultUnit: 'g' },
] as { _id: Id<'products'>; name: string; defaultUnit: ProductUnit }[];

const match = createProductMatcher(products);
const ids = (name: string, unit: ProductUnit | null = null) =>
  match({ name, unit }).map(({ product }) => product._id);

test('matches exact names, accents, preparation words and French plurals', () => {
  expect(ids('farine', 'g')[0]).toBe('flour');
  expect(ids('oeufs')[0]).toBe('egg');
  expect(ids('\u0153ufs')[0]).toBe('egg');
  expect(ids('saumon coup\u00e9')[0]).toBe('salmon');
  expect(ids('creme fraiche')[0]).toBe('cream');
});

test('preserves meaningful modifiers and ranks exact products above more specific ones', () => {
  expect(ids('saumon fum\u00e9')[0]).toBe('smoked-salmon');
  const [oil, sesameOil] = match({ name: 'huile', unit: null });
  expect(oil.product._id).toBe('oil');
  expect(sesameOil.product._id).toBe('sesame-oil');
  expect(sesameOil.score).toBeLessThan(oil.score);
});

test('tolerates probable typos but never matches by units or vague similarity alone', () => {
  expect(ids('farinne')[0]).toBe('flour');
  expect(ids('sucre', 'kg')).toEqual([]);
  expect(ids('sel', 'g')).toEqual([]);
  expect(ids('')).toEqual([]);
  expect(ids('de la')).toEqual([]);
});

test('enriches recipes with ranked product IDs without changing quantities', () => {
  const recipe: MarmitonRecipe = {
    name: 'Test',
    difficulty: 'easy',
    people: 2,
    prepTime: 10,
    cookTime: 20,
    steps: ['Mix'],
    ingredients: [
      { name: 'farine', quantity: 200, unit: 'g' },
      { name: 'sucre', quantity: null, unit: null },
    ],
  };
  const matched = matchRecipeProducts(recipe, products);
  expect(matched.ingredients[0]).toEqual({
    ...recipe.ingredients[0],
    productIds: ['flour'] as Id<'products'>[],
    productId: 'flour' as Id<'products'>,
  });
  expect(matched.ingredients[1].productIds).toEqual([]);
  expect(matched.ingredients[1].productId).toBeNull();
  expect(matched.steps).toBe(recipe.steps);
  expect(matchRecipeProducts(recipe, []).ingredients[0].productIds).toEqual([]);
});

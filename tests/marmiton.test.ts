import { test, expect } from 'vite-plus/test';
import {
  cleanRecipeName,
  parseIngredient,
  parseMarmitonRecipe,
  searchMarmitonRecipe,
} from '../convex/recipes/marmiton.ts';

const recipe = {
  '@type': 'Recipe',
  name: 'Soupe &amp; pain',
  recipeYield: '4 personnes',
  recipeIngredient: ['20 cl de lait', '1 1/2 cuill\u00e8res \u00e0 soupe de sucre', 'sel'],
  recipeInstructions: [{ '@type': 'HowToSection', itemListElement: [{ text: 'M\u00e9langer.' }] }],
  prepTime: 'PT1H15M',
  cookTime: 'PT30M',
  keywords: 'soupe, tr\u00e8s facile, bon march\u00e9',
};
const html = `<script type="application/ld+json">broken</script><script type="application/ld+json">${JSON.stringify({ '@graph': [recipe] })}</script>`;

test('parses French quantities, units, fractions and unknown quantities', () => {
  expect(parseIngredient('20 cl de lait')).toEqual({ quantity: 200, unit: 'ml', name: 'lait' });
  expect(parseIngredient('1 1/2 cuill\u00e8res \u00e0 soupe de sucre')).toEqual({
    quantity: 1.5,
    unit: 'tablespoon',
    name: 'sucre',
  });
  expect(parseIngredient('1\u00bd kg de farine')).toEqual({
    quantity: 1.5,
    unit: 'kg',
    name: 'farine',
  });
  expect(parseIngredient('1 \u00bd kg de farine')).toEqual({
    quantity: 1.5,
    unit: 'kg',
    name: 'farine',
  });
  expect(parseIngredient('2 oeufs')).toEqual({ quantity: 2, unit: 'pieces', name: 'oeufs' });
  expect(parseIngredient('1,5 dl d\u2019eau')).toEqual({
    quantity: 150,
    unit: 'ml',
    name: 'eau',
  });
  expect(parseIngredient('sel')).toEqual({ quantity: null, unit: null, name: 'sel' });
  expect(parseIngredient('1/0 g de sel')).toEqual({
    quantity: null,
    unit: null,
    name: '1/0 g de sel',
  });
});

test('reads JSON-LD graphs, nested instructions and duration in minutes', () => {
  const result = parseMarmitonRecipe(html);
  expect(result?.name).toBe('Soupe & pain');
  expect(result?.people).toBe(4);
  expect(result?.difficulty).toBe('easy');
  expect(result?.prepTime).toBe(75);
  expect(result?.cookTime).toBe(30);
  expect(result?.steps).toEqual(['M\u00e9langer.']);
  expect(result?.ingredients.length).toBe(3);
  expect(parseMarmitonRecipe('<html></html>')).toBeNull();
});

test('supports JSON-LD type arrays and fractional durations, ignores invalid durations', () => {
  const parseWith = (data: Record<string, unknown>) =>
    parseMarmitonRecipe(`<script type="application/ld+json">${JSON.stringify([data])}</script>`);
  const result = parseWith({
    ...recipe,
    '@type': ['Thing', 'Recipe'],
    keywords: ['difficile'],
    prepTime: 'P1DT1.5H',
  });
  expect(result?.difficulty).toBe('hard');
  expect(result?.prepTime).toBe(1530);
  expect(parseWith({ ...recipe, prepTime: 'PT30M1H' })?.prepTime).toBe(0);
});

test('takes the first search result, not the highest-rated one', async () => {
  const calls: string[] = [];
  const fetchPage = async (input: URL | RequestInfo) => {
    calls.push(input instanceof Request ? input.url : input.toString());
    return new Response(
      calls.length === 1
        ? '<ul class="search-list"><li class="search-list__item"><a class="card-content__title" href="/recettes/recette_soupe_1.aspx">Soupe</a><span class="rating__rating">3/5</span></li><li class="search-list__item"><a class="card-content__title" href="/recettes/recette_pain_2.aspx">Pain</a><span class="rating__rating">5/5</span></li></ul>'
        : html,
    );
  };
  expect((await searchMarmitonRecipe(' soupe & pain ', fetchPage))?.people).toBe(4);
  expect(new URL(calls[0]).searchParams.get('aqt')).toBe('soupe & pain');
  expect(calls[1]).toBe('https://www.marmiton.org/recettes/recette_soupe_1.aspx');
});

test('handles empty results and rejects invalid inputs, HTTP failures and off-site URLs', async () => {
  expect(await searchMarmitonRecipe('soupe', async () => new Response('<html></html>'))).toBeNull();
  await expect(searchMarmitonRecipe(' ')).rejects.toThrow(/Search must/);
  await expect(
    searchMarmitonRecipe('soupe', async () => new Response('', { status: 403 })),
  ).rejects.toThrow(/403/);
  await expect(
    searchMarmitonRecipe(
      'soupe',
      async () =>
        new Response(
          '<ul class="search-list"><li class="search-list__item"><a class="card-content__title" href="https://example.com/recettes/recette_1">Link</a></li></ul>',
        ),
    ),
  ).rejects.toThrow(/Invalid Marmiton recipe URL/);
});

test('strips the SEO suffix from recipe titles', () => {
  expect(cleanRecipeName('Lasagnes \u00e0 la bolognaise : la meilleure recette')).toBe(
    'Lasagnes \u00e0 la bolognaise',
  );
  expect(cleanRecipeName('Tarte : d\u00e9couvrez les recettes')).toBe('Tarte');
  expect(cleanRecipeName('Soupe : \u00e0 la tomate')).toBe('Soupe : \u00e0 la tomate');
});

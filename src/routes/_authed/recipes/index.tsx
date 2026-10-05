import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FunctionReturnType } from 'convex/server';
import { useCallback, useMemo, useState } from 'react';
import { RecipeList } from '@/components/recipes/recipe-list';
import { RecipesToolbar } from '@/components/recipes/recipes-toolbar';

export const Route = createFileRoute('/_authed/recipes/')({
  component: RecipesPage,
  loader: async ({ context }) => {
    await context.convexQueryClient.queryClient.query({
      ...convexQuery(api.recipes.queries.getRecipes, {}),
      staleTime: 'static',
    });
  },
});

type Recipes = FunctionReturnType<typeof api.recipes.queries.getRecipes>;

interface Filters {
  search: string;
  difficulty: string;
  showFavoritesOnly: boolean;
}

function useFilters(recipes: Recipes) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    difficulty: 'all',
    showFavoritesOnly: false,
  });

  const filterOnSearchTerm = useCallback(
    (recipe: Recipes[number]) => {
      const haystack = [
        recipe.name,
        ...recipe.instructions.map((step) => step.text),
        ...recipe.products.map((product) => product.product.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(filters.search.toLowerCase());
    },
    [filters.search],
  );

  const filterOnDifficulty = useCallback(
    (recipe: Recipes[number]) =>
      filters.difficulty === 'all' || recipe.difficulty === filters.difficulty,
    [filters.difficulty],
  );

  const filterOnFavorites = useCallback(
    (recipe: Recipes[number]) => !filters.showFavoritesOnly || recipe.isFavorite,
    [filters.showFavoritesOnly],
  );

  const filteredRecipes = useMemo(
    () =>
      recipes.filter(
        (recipe) =>
          filterOnSearchTerm(recipe) && filterOnDifficulty(recipe) && filterOnFavorites(recipe),
      ),
    [recipes, filterOnSearchTerm, filterOnDifficulty, filterOnFavorites],
  );

  return { filters, setFilters, filteredRecipes };
}

function RecipesPage() {
  const { data: recipes } = useSuspenseQuery(convexQuery(api.recipes.queries.getRecipes, {}));
  const { filters, setFilters, filteredRecipes } = useFilters(recipes);

  return (
    <div className="space-y-4 py-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Recettes</h1>
        <p className="text-muted-foreground">
          Gérez vos recettes ({filteredRecipes.length}
          {filteredRecipes.length > 1 ? ' recettes' : ' recette'})
        </p>
      </div>
      <RecipesToolbar onFilter={setFilters} canCreate filters={filters} />
      <RecipeList
        recipes={filteredRecipes}
        emptyMessage={
          recipes.length === 0
            ? 'Aucune recette pour le moment'
            : 'Aucune recette ne correspond à vos filtres'
        }
      />
    </div>
  );
}

import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FunctionReturnType } from 'convex/server';
import { useCallback, useMemo, useState } from 'react';
import { RecipeList } from '@/components/recipes/recipe-list';
import { RecipesToolbar } from '@/components/recipes/recipes-toolbar';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/_authed/recipes/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const householdId = context.householdId;
    if (householdId) {
      await context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.recipes.queries.getRecipes, {
          publicId: householdId,
        }),
      );
    }

    return {
      breadcrumbs: 'Liste des recettes',
      householdId: householdId,
    };
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
        ...recipe.instructions.map((s) => s.text),
        ...recipe.products.map((p) => p.product.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(filters.search.toLowerCase());
    },
    [filters.search],
  );

  const filterOnDifficulty = useCallback(
    (recipe: Recipes[number]) => {
      return (
        filters.difficulty === 'all' || recipe.difficulty === filters.difficulty
      );
    },
    [filters.difficulty],
  );

  const filterOnFavorites = useCallback(
    (recipe: Recipes[number]) => {
      return !filters.showFavoritesOnly || recipe.isFavorite;
    },
    [filters.showFavoritesOnly],
  );

  const filteredRecipes = useMemo(() => {
    return recipes.filter(
      (recipe) =>
        filterOnSearchTerm(recipe) &&
        filterOnDifficulty(recipe) &&
        filterOnFavorites(recipe),
    );
  }, [recipes, filterOnSearchTerm, filterOnDifficulty, filterOnFavorites]);

  return { filters, setFilters, filteredRecipes };
}

function RouteComponent() {
  const { householdId } = Route.useLoaderData();
  const { currentMember } = useCurrentMember();

  const { data: recipes = [] } = useSuspenseQuery(
    convexQuery(api.recipes.queries.getRecipes, { publicId: householdId }),
  );

  const { filters, setFilters, filteredRecipes } = useFilters(recipes);

  return (
    <div className="space-y-4 mx-auto py-6 container">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Recettes</h1>
        <p className="text-muted-foreground">
          Gérez vos recettes ({filteredRecipes.length}
          {filteredRecipes.length > 1 ? ' recettes' : ' recette'})
        </p>
      </div>

      <RecipesToolbar
        onFilter={setFilters}
        canCreate={currentMember?.status === 'accepted'}
        filters={filters}
      />

      <RecipeList
        recipes={filteredRecipes}
        householdId={householdId}
        emptyMessage={
          recipes.length === 0
            ? 'Aucune recette pour le moment'
            : 'Aucune recette ne correspond à vos filtres'
        }
      />
    </div>
  );
}

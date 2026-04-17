import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FunctionReturnType } from 'convex/server';
import { Bot } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { RecipeChatbot } from '@/components/recipes/recipe-chatbot';
import { RecipeList } from '@/components/recipes/recipe-list';
import { RecipesToolbar } from '@/components/recipes/recipes-toolbar';
import { Button } from '@/components/ui/button';
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
  const [chatOpen, setChatOpen] = useState(false);

  const { data: recipes = [] } = useSuspenseQuery(
    convexQuery(api.recipes.queries.getRecipes, { publicId: householdId }),
  );

  const { filters, setFilters, filteredRecipes } = useFilters(recipes);

  return (
    <div className="flex gap-4 mx-auto py-6 container h-[calc(100vh-8rem)]">
      {/* Main content */}
      <div
        className={`flex flex-col gap-4 min-w-0 transition-all duration-300 ${chatOpen ? 'flex-1' : 'w-full'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-bold text-3xl tracking-tight">Recettes</h1>
            <p className="text-muted-foreground">
              Gérez vos recettes ({filteredRecipes.length}
              {filteredRecipes.length > 1 ? ' recettes' : ' recette'})
            </p>
          </div>
          <Button
            variant={chatOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatOpen((v) => !v)}
            className="shrink-0 gap-2"
          >
            <Bot className="size-4" />
            {chatOpen ? "Fermer l'assistant" : 'Assistant IA'}
          </Button>
        </div>

        <RecipesToolbar
          onFilter={setFilters}
          canCreate={currentMember?.status === 'accepted'}
          filters={filters}
        />

        <div className="flex-1 overflow-auto">
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
      </div>

      {/* Chatbot panel */}
      {chatOpen && (
        <div className="w-95 shrink-0 h-full">
          <RecipeChatbot householdId={householdId} />
        </div>
      )}
    </div>
  );
}

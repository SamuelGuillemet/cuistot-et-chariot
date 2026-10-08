import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BackLink } from '@/components/layout/back-link';
import { RecipeInstructionsDisplay } from '@/components/recipes/details/recipe-instructions-display';
import { RecipeProductsList } from '@/components/recipes/details/recipe-products-list';
import { RecipeDetailHeader } from '@/components/recipes/recipe-detail-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authed/recipes/$recipeId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.convexQueryClient.queryClient.query({
      ...convexQuery(api.recipes.queries.getRecipeById, { recipeId: params.recipeId }),
      staleTime: 'static',
    });
  },
});

function RouteComponent() {
  const { recipeId } = Route.useParams();
  const navigate = useNavigate();

  const { data: recipeData } = useSuspenseQuery(
    convexQuery(api.recipes.queries.getRecipeById, { recipeId }),
  );

  if (!recipeData) {
    return (
      <div className="space-y-4 my-5">
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <p className="font-medium text-lg">Recette non trouvée</p>
          <p className="max-w-md text-muted-foreground text-sm">
            Cette recette n'existe pas ou vous n'avez pas accès à celle-ci.
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    void navigate({ to: '/recipes/$recipeId/edit', params: { recipeId } });
  };

  return (
    <div className="space-y-6 my-5">
      <BackLink to="/recipes">Toutes les recettes</BackLink>

      <RecipeDetailHeader
        recipe={recipeData}
        isFavorite={recipeData.isFavorite}
        onEdit={handleEdit}
      />

      <div className="gap-6 grid md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeInstructionsDisplay
                instructions={recipeData.instructions}
                recipeId={recipeId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Ingredients first on mobile: the servings control lives there. */}
        <div className="space-y-6 max-md:order-first">
          <RecipeProductsList
            recipeProducts={recipeData.products}
            originalServings={recipeData.servings}
          />
        </div>
      </div>
    </div>
  );
}

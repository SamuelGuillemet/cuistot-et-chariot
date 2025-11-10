import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RecipeDetailHeader } from '@/components/recipes/recipe-detail-header';
import { RecipeInstructionsDisplay } from '@/components/recipes/recipe-instructions-display';
import { RecipeProductsList } from '@/components/recipes/recipe-products-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/_authed/recipes/$recipeId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const householdId = context.householdId;
    if (householdId) {
      await context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.recipes.queries.getRecipeById, {
          publicId: householdId,
          recipeId: params.recipeId,
        }),
      );
    }

    return {
      householdId: householdId,
      breadcrumbs: 'Détail',
    };
  },
});

function RouteComponent() {
  const { householdId } = Route.useLoaderData();
  const { recipeId } = Route.useParams();
  const { currentMember } = useCurrentMember();
  const navigate = useNavigate();

  const { data: recipeData } = useSuspenseQuery(
    convexQuery(api.recipes.queries.getRecipeById, {
      publicId: householdId,
      recipeId: recipeId,
    }),
  );

  if (!recipeData) {
    return (
      <div className="space-y-4 mx-auto py-6 container">
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <p className="font-medium text-lg">Recette non trouvée</p>
          <p className="max-w-md text-muted-foreground text-sm">
            Cette recette n'existe pas ou vous n'avez pas accès à ce foyer.
          </p>
        </div>
      </div>
    );
  }

  const canEdit = currentMember?.status === 'accepted';

  const handleEdit = () => {
    navigate({ to: '/recipes/$recipeId/edit', params: { recipeId } });
  };

  return (
    <div className="space-y-6 mx-auto py-6 container">
      <RecipeDetailHeader
        recipe={recipeData}
        isFavorite={recipeData.isFavorite}
        householdId={householdId}
        canEdit={canEdit}
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
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RecipeProductsList
            recipeProducts={recipeData.products}
            canEdit={false}
            originalServings={recipeData.servings}
          />
        </div>
      </div>
    </div>
  );
}

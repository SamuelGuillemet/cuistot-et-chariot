import { api } from '@api/api';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { type Recipe, RecipeForm } from '@/components/recipes/recipe-form';

export const Route = createFileRoute('/_authed/recipes/$recipeId/edit')({
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

  const { mutate: updateRecipe, isPending } = useMutation({
    mutationFn: useConvexMutation(api.recipes.mutations.updateRecipe),
    onSuccess: async () => {
      toast.success('Recette mise à jour avec succès');
      await navigate({ to: '/recipes/$recipeId', params: { recipeId } });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de la recette');
    },
  });

  const handleSubmit = (values: Recipe) => {
    updateRecipe({
      recipeId: recipeId,
      ...values,
    });
  };

  if (!recipeData) {
    return (
      <div className="space-y-4 mx-auto py-6 container">
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <p className="font-medium text-lg">Accès refusé</p>
          <p className="max-w-md text-muted-foreground text-sm">
            Vous n'avez pas les permissions pour modifier cette recette.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-auto py-6 max-w-4xl container">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Modifier la recette</h1>
        <p className="text-muted-foreground">Modifiez les informations de votre recette.</p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        defaultValues={recipeData}
        submitText="Mettre à jour la recette"
        recipeId={recipeId}
      />
    </div>
  );
}

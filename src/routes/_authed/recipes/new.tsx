import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { type Recipe, RecipeForm } from '@/components/recipes/recipe-form';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/_authed/recipes/new')({
  component: RouteComponent,
  loader: async ({ context }) => {
    return {
      householdId: context.householdId,
      breadcrumbs: 'Nouvelle recette',
    };
  },
});

function RouteComponent() {
  const { householdId } = Route.useLoaderData();
  const { currentMember } = useCurrentMember();
  const navigate = useNavigate();

  const { mutate: createRecipe, isPending } = useMutation({
    mutationFn: useConvexMutation(api.recipes.mutations.createRecipe),
    onSuccess: () => {
      toast.success('Recette créée avec succès');
      navigate({ to: '/recipes' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de la recette');
    },
  });

  const handleSubmit = (values: Recipe) => {
    createRecipe({
      publicId: householdId,
      ...values,
    });
  };

  // Check permission
  if (currentMember?.status !== 'accepted') {
    return (
      <div className="space-y-4 mx-auto py-6 container">
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <p className="font-medium text-lg">Accès refusé</p>
          <p className="max-w-md text-muted-foreground text-sm">
            Vous devez être un membre accepté pour créer des recettes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-auto py-6 max-w-4xl container">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">
          Créer une nouvelle recette
        </h1>
        <p className="text-muted-foreground">
          Ajoutez une nouvelle recette à votre collection.
        </p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitText="Créer la recette"
        householdId={householdId}
      />
    </div>
  );
}

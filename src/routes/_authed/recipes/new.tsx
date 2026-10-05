import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { type Recipe, RecipeForm } from '@/components/recipes/recipe-form';

export const Route = createFileRoute('/_authed/recipes/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { mutate: createRecipe, isPending } = useMutation({
    mutationFn: useConvexMutation(api.recipes.mutations.createRecipe),
    onSuccess: async () => {
      toast.success('Recette créée avec succès');
      await navigate({ to: '/recipes' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de la recette');
    },
  });

  const handleSubmit = (values: Recipe) => {
    createRecipe(values);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0 mt-5">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Créer une nouvelle recette</h1>
        <p className="text-muted-foreground">Ajoutez une nouvelle recette à votre collection.</p>
      </div>

      <RecipeForm onSubmit={handleSubmit} isLoading={isPending} submitText="Créer la recette" />
    </div>
  );
}

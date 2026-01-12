import { api } from '@api/api';
import type { Doc } from '@api/dataModel';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecipeDeleteDialogProps {
  readonly recipe: Doc<'recipes'>;
  readonly householdId: string;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function RecipeDeleteDialog({
  recipe,
  householdId,
  isOpen,
  onOpenChange,
}: RecipeDeleteDialogProps) {
  const navigate = useNavigate();

  const { mutate: deleteRecipe, isPending } = useMutation({
    mutationFn: useConvexMutation(api.recipes.mutations.deleteRecipe),
    onSuccess: () => {
      toast.success('Recette supprimée avec succès');
      onOpenChange(false);
      navigate({ to: '/recipes' });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la recette');
    },
  });

  const handleDelete = () => {
    deleteRecipe({ publicId: householdId, recipeId: recipe._id });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la recette ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la recette "{recipe.name}" ?
            Cette action est irréversible et supprimera également tous les
            ingrédients et favoris associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

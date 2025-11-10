import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { HeartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecipeFavoriteButtonProps {
  readonly recipeId: string;
  readonly isFavorite: boolean;
  readonly householdId: string;
  readonly className?: string;
  readonly size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function RecipeFavoriteButton({
  recipeId,
  isFavorite,
  householdId,
  className,
  size = 'icon',
}: RecipeFavoriteButtonProps) {
  const mutationFn = useConvexMutation(
    api.recipes.mutations.toggleRecipeFavorite,
  );

  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success(
        data.isFavorite
          ? 'Recette ajoutée aux favoris'
          : 'Recette retirée des favoris',
      );
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des favoris');
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ publicId: householdId, recipeId });
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(className)}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <HeartIcon
        className={cn(
          'w-5 h-5',
          isFavorite && 'fill-red-500 text-red-500',
          !isFavorite && 'text-muted-foreground',
        )}
      />
    </Button>
  );
}

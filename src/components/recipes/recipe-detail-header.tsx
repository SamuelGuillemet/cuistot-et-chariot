import type { Doc } from 'convex/_generated/dataModel';
import { Separator } from '@/components/ui/separator';
import { RecipeActionsDropdown } from './recipe-actions-dropdown';
import { RecipeDifficultyBadge } from './recipe-difficulty-badge';
import { RecipeFavoriteButton } from './recipe-favorite-button';
import { RecipeServingsDisplay } from './recipe-servings-display';
import { RecipeTimeDisplay } from './recipe-time-display';

interface RecipeDetailHeaderProps {
  readonly recipe: Doc<'recipes'>;
  readonly isFavorite: boolean;
  readonly householdId: string;
  readonly canEdit: boolean;
  readonly onEdit: () => void;
}

export function RecipeDetailHeader({
  recipe,
  isFavorite,
  householdId,
  canEdit,
  onEdit,
}: RecipeDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="font-bold text-3xl tracking-tight">{recipe.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <RecipeDifficultyBadge difficulty={recipe.difficulty} />
            <RecipeServingsDisplay servings={recipe.servings} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RecipeFavoriteButton
            recipeId={recipe._id}
            isFavorite={isFavorite}
            householdId={householdId}
            size="default"
          />
          <RecipeActionsDropdown
            recipe={recipe}
            householdId={householdId}
            canEdit={canEdit}
            onEdit={onEdit}
          />
        </div>
      </div>

      <RecipeTimeDisplay
        prepTime={recipe.prepTime}
        cookTime={recipe.cookTime}
      />

      <Separator />
    </div>
  );
}

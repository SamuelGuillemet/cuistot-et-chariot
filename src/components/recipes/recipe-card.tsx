import { Link } from '@tanstack/react-router';
import type { Doc } from 'convex/_generated/dataModel';
import { ChefHatIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeDifficultyBadge } from './recipe-difficulty-badge';
import { RecipeFavoriteButton } from './recipe-favorite-button';
import { RecipeServingsDisplay } from './recipe-servings-display';
import { RecipeTimeDisplay } from './recipe-time-display';

interface RecipeCardProps {
  readonly recipe: Doc<'recipes'> & {
    readonly isFavorite: boolean;
    readonly favoriteCount?: number;
  };
  readonly householdId: string;
}

export function RecipeCard({ recipe, householdId }: RecipeCardProps) {
  return (
    <Link
      to="/recipes/$recipeId"
      params={{ recipeId: recipe._id }}
      className="block hover:scale-[1.02] transition-transform"
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-primary/10 p-3 rounded-lg">
              <ChefHatIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2">
                {recipe.name}
              </CardTitle>
            </div>
            <RecipeFavoriteButton
              recipeId={recipe._id}
              isFavorite={recipe.isFavorite}
              householdId={householdId}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <RecipeDifficultyBadge difficulty={recipe.difficulty} />
            <RecipeServingsDisplay servings={recipe.servings} />
          </div>

          <RecipeTimeDisplay
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            className="text-xs"
          />
        </CardContent>
      </Card>
    </Link>
  );
}

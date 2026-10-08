import type { Doc } from '@api/dataModel';
import { Link } from '@tanstack/react-router';
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
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="relative hover:bg-accent/30 h-full transition-colors">
      <CardHeader>
        <div className="flex items-start gap-3">
          <CardTitle className="flex-1 min-w-0 self-center text-lg line-clamp-2">
            {/* The link stretches over the whole card; the favourite button sits above it. */}
            <Link
              to="/recipes/$recipeId"
              params={{ recipeId: recipe._id }}
              className="after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:outline-none"
            >
              {recipe.name}
            </Link>
          </CardTitle>
          <div className="z-10 relative">
            <RecipeFavoriteButton
              recipeId={recipe._id}
              recipeName={recipe.name}
              isFavorite={recipe.isFavorite}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <RecipeDifficultyBadge difficulty={recipe.difficulty} />
          <RecipeServingsDisplay servings={recipe.servings} />
        </div>

        <RecipeTimeDisplay
          compact
          prepTime={recipe.prepTime}
          cookTime={recipe.cookTime}
          className="text-xs"
        />
      </CardContent>
    </Card>
  );
}

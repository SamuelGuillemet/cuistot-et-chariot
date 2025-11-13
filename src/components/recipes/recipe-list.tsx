import type { Doc } from 'convex/_generated/dataModel';
import { RecipeCard } from './recipe-card';

interface RecipeListProps {
  readonly recipes: (Doc<'recipes'> & {
    readonly isFavorite: boolean;
    readonly favoriteCount?: number;
  })[];
  readonly householdId: string;
  readonly emptyMessage?: string;
}

export function RecipeList({
  recipes,
  householdId,
  emptyMessage = 'Aucune recette trouvée',
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
        <div className="space-y-1">
          <p className="font-medium text-lg">{emptyMessage}</p>
          <p className="max-w-md text-muted-foreground text-sm">
            Commencez en créant votre première recette.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          householdId={householdId}
        />
      ))}
    </div>
  );
}

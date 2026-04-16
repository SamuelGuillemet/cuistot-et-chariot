import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChefHatIcon, GripVerticalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DraggableRecipe {
  id: string;
  name: string;
  servings: number;
  prepTime: number;
  cookTime: number;
}

interface DraggableRecipeCardProps {
  recipe: DraggableRecipe;
}

export function DraggableRecipeCard({ recipe }: DraggableRecipeCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `recipe-${recipe.id}`,
      data: {
        type: 'recipe',
        recipeId: recipe.id,
        recipeName: recipe.name,
        defaultServings: recipe.servings,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm transition-shadow',
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-primary/30 cursor-grabbing'
          : 'cursor-grab hover:shadow-md hover:ring-1 hover:ring-border',
      )}
      {...listeners}
      {...attributes}
    >
      <span className="text-muted-foreground/50 group-hover:text-muted-foreground shrink-0">
        <GripVerticalIcon className="size-4" />
      </span>
      <ChefHatIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-medium">{recipe.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {recipe.prepTime + recipe.cookTime}min
      </span>
    </div>
  );
}

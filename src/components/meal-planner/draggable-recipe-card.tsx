import { useDraggable } from '@dnd-kit/react';
import { ClockIcon, GripVerticalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DraggedRecipeData {
  recipeId: string;
  recipeName: string;
  defaultServings: number;
  totalTime: number;
}

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
  const totalTime = recipe.prepTime + recipe.cookTime;

  const { ref, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: {
      type: 'recipe',
      recipeId: recipe.id,
      recipeName: recipe.name,
      defaultServings: recipe.servings,
      totalTime,
    },
  });

  return (
    <div
      ref={ref}
      className={cn(
        'group flex items-center gap-2 bg-card shadow-xs px-2.5 py-2 border rounded-lg text-sm transition-shadow select-none',
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-primary/40 cursor-grabbing'
          : 'cursor-grab hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
      )}
    >
      <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors shrink-0">
        <GripVerticalIcon className="size-4" />
      </span>
      <span className="flex-1 min-w-0 font-semibold text-foreground/90 truncate">
        {recipe.name}
      </span>
      {totalTime > 0 && (
        <span className="flex items-center gap-1 font-medium text-[11px] text-muted-foreground/70 shrink-0">
          <ClockIcon className="size-3" />
          {totalTime}min
        </span>
      )}
    </div>
  );
}

export function DraggedRecipeCard(data: DraggedRecipeData) {
  const totalTime = data.totalTime;
  return (
    <div className="flex items-center gap-2 bg-card opacity-50 shadow-lg px-2.5 py-2 border rounded-lg ring-2 ring-primary/40 text-sm rotate-2 cursor-grabbing">
      <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors shrink-0">
        <GripVerticalIcon className="size-4" />
      </span>
      <span className="flex-1 min-w-0 font-semibold text-foreground/90 truncate">
        {data.recipeName}
      </span>
      {totalTime > 0 && (
        <span className="flex items-center gap-1 font-medium text-[11px] text-muted-foreground/70 shrink-0">
          <ClockIcon className="size-3" />
          {totalTime}min
        </span>
      )}
    </div>
  );
}

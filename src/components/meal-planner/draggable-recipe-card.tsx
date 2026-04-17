import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `recipe-${recipe.id}`,
      data: {
        type: 'recipe',
        recipeId: recipe.id,
        recipeName: recipe.name,
        defaultServings: recipe.servings,
        totalTime,
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
        'group flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-sm shadow-xs transition-shadow select-none',
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-primary/40 cursor-grabbing'
          : 'cursor-grab hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
      )}
      {...listeners}
      {...attributes}
    >
      <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 shrink-0 transition-colors">
        <GripVerticalIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground/90">
        {recipe.name}
      </span>
      {totalTime > 0 && (
        <span className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground/70 font-medium">
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
    <div className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-sm opacity-50 shadow-lg ring-2 ring-primary/40 cursor-grabbing rotate-2">
      <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 shrink-0 transition-colors">
        <GripVerticalIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground/90">
        {data.recipeName}
      </span>
      {totalTime > 0 && (
        <span className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground/70 font-medium">
          <ClockIcon className="size-3" />
          {totalTime}min
        </span>
      )}
    </div>
  );
}

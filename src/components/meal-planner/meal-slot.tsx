import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useDroppable } from '@dnd-kit/core';
import { useMutation } from '@tanstack/react-query';
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getWeekStart } from '@/utils/week';
import type { MealType } from '../../../convex/types';
import {
  optimisticDeleteMealPlan,
  optimisticUpdateServings,
} from './optimistic-updates';

export interface MealSlotData {
  id: string;
  recipeName: string;
  servings: number;
}

interface MealSlotProps {
  date: string;
  mealType: MealType;
  mealLabel: string;
  meal: MealSlotData | null;
  householdId: string;
}

export function MealSlot({
  date,
  mealType,
  mealLabel,
  meal,
  householdId,
}: MealSlotProps) {
  const droppableId = `slot-${date}-${mealType}`;

  const weekStart = getWeekStart(new Date(date));

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { type: 'slot', date, mealType },
  });

  const deleteMealPlanFn = useConvexMutation(
    api.meal_plans.mutations.deleteMealPlan,
  ).withOptimisticUpdate((localStore, args) =>
    optimisticDeleteMealPlan(localStore, args, weekStart),
  );

  const { mutate: deleteMealPlan } = useMutation({
    mutationFn: deleteMealPlanFn,
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const updateServingsFn = useConvexMutation(
    api.meal_plans.mutations.updateServings,
  ).withOptimisticUpdate((localStore, args) =>
    optimisticUpdateServings(localStore, args, weekStart),
  );

  const { mutate: updateServings } = useMutation({
    mutationFn: updateServingsFn,
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleDelete = () => {
    if (!meal) return;
    deleteMealPlan({ publicId: householdId, mealPlanId: meal.id });
  };

  const handleServingsChange = (delta: number) => {
    if (!meal) return;
    const next = Math.max(1, meal.servings + delta);
    updateServings({
      publicId: householdId,
      mealPlanId: meal.id,
      servings: next,
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {mealLabel}
      </span>
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-17.5 rounded-md border-2 border-dashed p-2 transition-colors',
          isOver
            ? 'border-primary/60 bg-primary/5'
            : meal
              ? 'border-border bg-card'
              : 'border-border/50 bg-muted/20 hover:border-border/70',
        )}
      >
        {meal ? (
          <div className="flex h-full flex-col gap-1">
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-medium leading-tight min-w-0 flex-1 line-clamp-2">
                {meal.recipeName}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="shrink-0 rounded p-0.5 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-auto">
              <button
                type="button"
                onClick={() => handleServingsChange(-1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <MinusIcon className="size-3" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-center">
                {meal.servings}p
              </span>
              <button
                type="button"
                onClick={() => handleServingsChange(1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <PlusIcon className="size-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-muted-foreground/50">
              Déposer une recette
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

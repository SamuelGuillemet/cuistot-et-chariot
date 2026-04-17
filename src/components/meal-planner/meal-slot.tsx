import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useDroppable } from '@dnd-kit/core';
import { useMutation } from '@tanstack/react-query';
import { MinusIcon, PlusIcon, Users2Icon, XIcon } from 'lucide-react';
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
    <div className="flex flex-col gap-1.5 p-2.5">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        {mealLabel}
      </span>
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-16 rounded-lg border-2 border-dashed transition-all duration-200',
          isOver
            ? 'border-primary bg-primary/8 scale-[1.01]'
            : meal
              ? 'border-transparent bg-background shadow-sm'
              : 'border-border/40 bg-muted/20 hover:border-border/70 hover:bg-muted/30',
        )}
      >
        {meal ? (
          <div className="flex h-full flex-col gap-2 p-2">
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-semibold leading-tight min-w-0 flex-1 line-clamp-2">
                {meal.recipeName}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Supprimer"
              >
                <XIcon className="size-3" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-auto">
              <Users2Icon className="size-3 text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleServingsChange(-1)}
                className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Réduire les portions"
              >
                <MinusIcon className="size-3" />
              </button>
              <span className="text-xs font-medium text-muted-foreground min-w-[2ch] text-center tabular-nums">
                {meal.servings}
              </span>
              <button
                type="button"
                onClick={() => handleServingsChange(1)}
                className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Augmenter les portions"
              >
                <PlusIcon className="size-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-16 items-center justify-center group">
            <span className="text-xs text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors select-none">
              {isOver ? '↓ Déposer' : '+'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import { api } from '@api/api';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  formatDayLabelShort,
  formatWeekLabel,
  getWeekDates,
  getWeekStart,
  isCurrentWeek,
  shiftWeek,
} from '@/utils/week';
import type { MealType } from '../../../convex/types';
import { DayColumn } from './day-column';
import { DraggableRecipeCard } from './draggable-recipe-card';
import type { MealSlotData } from './meal-slot';
import { optimisticUpsertMealPlan } from './optimistic-updates';

interface MealPlannerGridProps {
  weekStart: string;
  householdId: string;
  onWeekChange: (weekStart: string) => void;
}

export function MealPlannerGrid({
  weekStart,
  householdId,
  onWeekChange,
}: MealPlannerGridProps) {
  const [activeDrag, setActiveDrag] = useState<{
    recipeId: string;
    recipeName: string;
    defaultServings: number;
  } | null>(null);

  const weekDates = getWeekDates(weekStart);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const todayIdx = weekDates.indexOf(todayStr);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const { data: mealPlans = [] } = useSuspenseQuery(
    convexQuery(api.meal_plans.queries.getMealPlansByWeek, {
      publicId: householdId,
      weekStart,
    }),
  );

  const { data: recipes = [] } = useSuspenseQuery(
    convexQuery(api.recipes.queries.getRecipes, { publicId: householdId }),
  );

  const upsertMealPlanFn = useConvexMutation(
    api.meal_plans.mutations.upsertMealPlan,
  ).withOptimisticUpdate(optimisticUpsertMealPlan);

  const { mutate: upsertMealPlan } = useMutation({
    mutationFn: upsertMealPlanFn,
    onError: () => toast.error('Erreur lors de la mise à jour du menu'),
  });

  const mealsByDate = useMemo(() => {
    // Build a map: date -> mealType -> MealSlotData
    const map = weekDates.reduce<
      Record<string, Partial<Record<MealType, MealSlotData>>>
    >((acc, date) => {
      acc[date] = {};
      return acc;
    }, {});

    for (const mp of mealPlans) {
      if (map[mp.date]) {
        map[mp.date][mp.mealType] = {
          id: mp._id,
          recipeName: mp.recipe.name,
          servings: mp.servings,
        };
      }
    }

    return map;
  }, [mealPlans, weekDates]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'recipe') {
      setActiveDrag({
        recipeId: data.recipeId,
        recipeName: data.recipeName,
        defaultServings: data.defaultServings,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'recipe' && overData?.type === 'slot') {
      upsertMealPlan({
        publicId: householdId,
        date: overData.date,
        mealType: overData.mealType,
        recipeId: activeData.recipeId,
        servings: activeData.defaultServings,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-5 text-muted-foreground" />
            <span className="font-semibold text-lg">
              {formatWeekLabel(weekStart)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentWeek(weekStart) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWeekChange(getWeekStart(new Date()))}
              >
                Aujourd'hui
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(shiftWeek(weekStart, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(shiftWeek(weekStart, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Mobile: day tabs + single column */}
          <div className="lg:hidden flex flex-col gap-3">
            <div className="flex rounded-lg border bg-muted/30 p-1 gap-1 overflow-x-auto">
              {weekDates.map((date, i) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setActiveDayIndex(i)}
                  className={`shrink-0 flex-1 min-w-12 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    i === activeDayIndex
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${date === todayStr ? 'font-bold' : ''}`}
                >
                  {formatDayLabelShort(date)}
                </button>
              ))}
            </div>
            <DayColumn
              date={weekDates[activeDayIndex]}
              meals={mealsByDate[weekDates[activeDayIndex]]}
              householdId={householdId}
              isToday={weekDates[activeDayIndex] === todayStr}
            />
          </div>

          {/* Desktop: full 7-column grid */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {weekDates.map((date) => (
              <DayColumn
                key={date}
                date={date}
                meals={mealsByDate[date]}
                householdId={householdId}
                isToday={date === todayStr}
              />
            ))}
          </div>

          {/* Recipe list */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recettes
            </p>
            {recipes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Aucune recette disponible
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recipes.map((recipe) => (
                  <DraggableRecipeCard
                    key={recipe._id}
                    recipe={{
                      id: recipe._id,
                      name: recipe.name,
                      servings: recipe.servings,
                      prepTime: recipe.prepTime,
                      cookTime: recipe.cookTime,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeDrag && (
          <div className="rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-lg ring-2 ring-primary/30 rotate-1 opacity-90">
            {activeDrag.recipeName}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

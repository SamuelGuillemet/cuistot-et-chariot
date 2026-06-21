import { api } from '@api/api';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import {
  DragDropProvider,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/react';
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
import {
  DraggableRecipeCard,
  DraggedRecipeCard,
  type DraggedRecipeData,
} from './draggable-recipe-card';
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
  const [activeDrag, setActiveDrag] = useState<DraggedRecipeData | null>(null);

  const weekDates = getWeekDates(weekStart);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const todayIdx = weekDates.indexOf(todayStr);
    return Math.max(todayIdx, 0);
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

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.operation.source?.data;
    if (data?.type === 'recipe') {
      setActiveDrag({
        recipeId: data.recipeId,
        recipeName: data.recipeName,
        defaultServings: data.defaultServings,
        totalTime: data.totalTime,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    if (event.canceled) return;

    const activeData = event.operation.source?.data;
    const overData = event.operation.target?.data;

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
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-5">
        {/* Week navigation */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted rounded-full size-8"
              onClick={() => onWeekChange(shiftWeek(weekStart, -1))}
              aria-label="Semaine précédente"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="font-bold text-foreground text-base">
                {formatWeekLabel(weekStart)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted rounded-full size-8"
              onClick={() => onWeekChange(shiftWeek(weekStart, 1))}
              aria-label="Semaine suivante"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          {!isCurrentWeek(weekStart) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full font-semibold text-xs"
              onClick={() => onWeekChange(getWeekStart(new Date()))}
            >
              Cette semaine
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Mobile: day tabs + single column */}
          <div className="lg:hidden flex flex-col gap-3">
            <div className="flex gap-0.5 bg-muted/20 p-1 border rounded-xl overflow-x-auto">
              {weekDates.map((date, i) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setActiveDayIndex(i)}
                  className={`shrink-0 flex-1 min-w-10 rounded-lg px-2 py-2 text-[11px] font-semibold transition-all ${
                    i === activeDayIndex
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${date === todayStr ? 'text-primary' : ''}`}
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
          <div className="hidden gap-2 lg:grid grid-cols-7">
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

          {/* Recipe tray */}
          <div className="bg-card shadow-xs border rounded-xl">
            <div className="flex justify-between items-center px-4 py-3 border-border/60 border-b">
              <p className="font-bold text-foreground text-sm">Recettes</p>
              <span className="font-medium text-muted-foreground text-xs">
                Glisser vers un créneau
              </span>
            </div>
            <div className="p-3">
              {recipes.length === 0 ? (
                <p className="py-4 text-muted-foreground text-xs text-center">
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
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDrag && <DraggedRecipeCard {...activeDrag} />}
      </DragOverlay>
    </DragDropProvider>
  );
}

import { api } from '@api/api';
import type { OptimisticLocalStore } from 'convex/browser';
import type { Id } from '../../../convex/_generated/dataModel';
import type { MealType } from '../../../convex/types';
import { getWeekStart } from '@/utils/week';

type UpsertArgs = {
  publicId: string;
  date: string;
  mealType: string;
  recipeId: string;
  servings: number;
};

type DeleteArgs = {
  publicId: string;
  mealPlanId: string;
};

type UpdateServingsArgs = {
  publicId: string;
  mealPlanId: string;
  servings: number;
};

export function optimisticUpsertMealPlan(
  localStore: OptimisticLocalStore,
  args: UpsertArgs,
) {
  const weekStart = getWeekStart(new Date(args.date));

  const current = localStore.getQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
  );
  if (current === undefined) return;

  const allRecipes = localStore.getQuery(api.recipes.queries.getRecipes, {
    publicId: args.publicId,
  });
  const fullRecipe = allRecipes?.find((r) => r._id === args.recipeId);
  if (!fullRecipe) return;

  const { isFavorite: _f, totalTime: _t, products: _p, ...recipe } = fullRecipe;

  const existingIndex = current.findIndex(
    (mp) => mp.date === args.date && mp.mealType === args.mealType,
  );

  const optimistic = {
    _id: crypto.randomUUID() as Id<'mealPlans'>,
    _creationTime: Date.now(),
    date: args.date,
    mealType: args.mealType as MealType,
    recipeId: args.recipeId as Id<'recipes'>,
    servings: args.servings,
    householdId: (current[0]?.householdId ?? '') as Id<'households'>,
    recipe,
  };

  const updated =
    existingIndex >= 0
      ? current.map((mp, i) => (i === existingIndex ? optimistic : mp))
      : [...current, optimistic];

  localStore.setQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
    updated,
  );
}

export function optimisticDeleteMealPlan(
  localStore: OptimisticLocalStore,
  args: DeleteArgs,
  weekStart: string,
) {
  const current = localStore.getQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
  );
  if (current === undefined) return;

  localStore.setQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
    current.filter((mp) => mp._id !== args.mealPlanId),
  );
}

export function optimisticUpdateServings(
  localStore: OptimisticLocalStore,
  args: UpdateServingsArgs,
  weekStart: string,
) {
  const current = localStore.getQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
  );
  if (current === undefined) return;

  localStore.setQuery(
    api.meal_plans.queries.getMealPlansByWeek,
    { publicId: args.publicId, weekStart },
    current.map((mp) =>
      mp._id === args.mealPlanId ? { ...mp, servings: args.servings } : mp,
    ),
  );
}

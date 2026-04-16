import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import { MealPlannerGrid } from '@/components/meal-planner/meal-planner-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { getWeekStart } from '@/utils/week';

export const Route = createFileRoute('/_authed/meal-planner')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const householdId = context.householdId;
    if (!householdId) {
      throw redirect({ to: '/dashboard' });
    }
    return { householdId };
  },
  loader: async ({ context }) => {
    const householdId = context.householdId;
    const weekStart = getWeekStart(new Date());

    if (householdId) {
      await Promise.all([
        context.convexQueryClient.queryClient.ensureQueryData(
          convexQuery(api.recipes.queries.getRecipes, {
            publicId: householdId,
          }),
        ),
        context.convexQueryClient.queryClient.ensureQueryData(
          convexQuery(api.meal_plans.queries.getMealPlansByWeek, {
            publicId: householdId,
            weekStart,
          }),
        ),
      ]);
    }

    return {
      breadcrumbs: 'Menu de la semaine',
      householdId,
      initialWeekStart: weekStart,
    };
  },

});

function MealPlannerSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="grid flex-1 grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
        <Skeleton className="w-56 h-52 rounded-lg" />
      </div>
    </div>
  );
}

function RouteComponent() {
  const { householdId, initialWeekStart } = Route.useLoaderData();
  const [weekStart, setWeekStart] = useState(initialWeekStart);

  return (
    <div className="space-y-4 mx-auto py-6 container">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Menu de la semaine</h1>
        <p className="text-muted-foreground">
          Planifiez vos repas en glissant vos recettes sur la grille.
        </p>
      </div>

      <Suspense fallback={<MealPlannerSkeleton />}>
        <MealPlannerGrid
          weekStart={weekStart}
          householdId={householdId}
          onWeekChange={setWeekStart}
        />
      </Suspense>
    </div>
  );
}

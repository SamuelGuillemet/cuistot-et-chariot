import { v } from 'convex/values';
import { nullThrows } from 'convex-helpers';
import { queryWithRLS } from './rls';

export const getMealPlansByWeek = queryWithRLS({
  args: {
    // ISO date of the Monday of the week: YYYY-MM-DD
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    const { householdId } = ctx;

    // Compute the 7 dates of the week
    const weekStartDate = new Date(args.weekStart);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const mealPlans = await ctx.db
      .query('mealPlans')
      .withIndex('by_householdId_date', (q) =>
        q
          .eq('householdId', householdId)
          .gte('date', dates[0])
          .lte('date', dates[6]),
      )
      .collect();

    const enriched = await Promise.all(
      mealPlans.map(async (mp) => {
        const recipe = nullThrows(await ctx.db.get(mp.recipeId));
        return { ...mp, recipe };
      }),
    );

    return enriched;
  },
});

import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';
import { mealTypeEnum } from '../meal_plans/schema';

// Requête interne utilisée par le cron : agrège repas du jour + subscriptions push
export const getMealNotificationData = internalQuery({
  args: {
    date: v.string(),
    mealType: mealTypeEnum,
  },
  handler: async (ctx, args) => {
    // Récupère tous les repas planifiés aujourd'hui pour ce type de repas
    const mealPlans = await ctx.db
      .query('mealPlans')
      .filter((q) =>
        q.and(
          q.eq(q.field('date'), args.date),
          q.eq(q.field('mealType'), args.mealType),
        ),
      )
      .collect();

    const result: {
      subscription: {
        endpoint: string;
        expirationTime?: number;
        p256dh: string;
        auth: string;
      };
      recipeName: string;
    }[] = [];

    for (const plan of mealPlans) {
      const recipe = await ctx.db.get(plan.recipeId);
      if (!recipe) continue;

      // Trouve tous les membres actifs du foyer
      const members = await ctx.db
        .query('householdMembers')
        .withIndex('by_householdId', (q) =>
          q.eq('householdId', plan.householdId),
        )
        .filter((q) => q.eq(q.field('status'), 'accepted'))
        .collect();

      for (const member of members) {
        // Récupère les subscriptions push de ce membre
        const subscriptions = await ctx.db
          .query('pushSubscriptions')
          .withIndex('by_userId', (q) => q.eq('userId', member.userId))
          .collect();

        for (const sub of subscriptions) {
          result.push({
            subscription: {
              endpoint: sub.endpoint,
              expirationTime: sub.expirationTime,
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
            recipeName: recipe.name,
          });
        }
      }
    }

    return result;
  },
});

'use node';

import webpush from 'web-push';
import { internal } from '../_generated/api';
import { internalAction } from '../_generated/server';
import { mealTypeEnum } from '../meal_plans/schema';

// Action Node.js — envoie les notifications push pour le repas du jour
// Appelée par le cron ; nécessite les variables d'environnement Convex :
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@example.com)
export const sendMealNotifications = internalAction({
  args: {
    mealType: mealTypeEnum,
  },
  handler: async (ctx, args) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      console.error(
        `[push] Variables VAPID manquantes. Définis VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT dans les variables d'environnement Convex.`,
      );
      return;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Date du jour au format YYYY-MM-DD en heure de Paris (UTC+1/+2)
    const now = new Date();
    const parisDate = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    // Intl retourne DD/MM/YYYY → on réorganise en YYYY-MM-DD
    const [day, month, year] = parisDate.split('/');
    const today = `${year}-${month}-${day}`;

    const notifications = await ctx.runQuery(
      internal.push_notifications.queries.getMealNotificationData,
      { date: today, mealType: args.mealType },
    );

    if (notifications.length === 0) {
      console.log(
        `[push] Aucun repas planifié pour ${args.mealType} le ${today}`,
      );
      return;
    }

    const title =
      args.mealType === 'lunch' ? '🍽️ Déjeuner du jour' : '🌙 Dîner ce soir';

    const results = await Promise.allSettled(
      notifications.map(async ({ subscription, recipeName }) => {
        const payload = JSON.stringify({
          title,
          body: recipeName,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        });

        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              expirationTime: subscription.expirationTime ?? null,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          // Subscription expirée ou invalide → on la supprime
          if (status === 410 || status === 404) {
            await ctx.runMutation(
              internal.push_notifications.mutations.deleteExpiredSubscription,
              { endpoint: subscription.endpoint },
            );
            console.log(
              `[push] Subscription expirée supprimée : ${subscription.endpoint}`,
            );
          } else {
            console.error(`[push] Erreur envoi :`, err);
          }
        }
      }),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    console.log(
      `[push] ${args.mealType} — ${sent}/${notifications.length} notifications envoyées`,
    );
  },
});

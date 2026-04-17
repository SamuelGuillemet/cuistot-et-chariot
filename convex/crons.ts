import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// 12h00 heure de Paris (UTC+1 hiver / UTC+2 été)
// → 11h UTC en hiver. Pour l'été, ajuste à 10h UTC si nécessaire.
crons.daily(
  'lunch-notification',
  { hourUTC: 11, minuteUTC: 0 },
  internal.push_notifications.action.sendMealNotifications,
  { mealType: 'lunch' },
);

// 19h00 heure de Paris
// → 18h UTC en hiver.
crons.daily(
  'dinner-notification',
  { hourUTC: 18, minuteUTC: 0 },
  internal.push_notifications.action.sendMealNotifications,
  { mealType: 'dinner' },
);

export default crons;

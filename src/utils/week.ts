const DAY_NAMES = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/** Returns the ISO date string (YYYY-MM-DD) of the Monday of the week containing `date`. */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Returns 7 ISO date strings for the week starting on `weekStart` (YYYY-MM-DD). */
export function getWeekDates(weekStart: string): string[] {
  const start = new Date(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Returns a human-readable label for a date string (YYYY-MM-DD). E.g. "Lundi 14 avr." */
export function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1];
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'short' });
  return `${dayName} ${day} ${month}`;
}

/** Returns a short label for a date string (YYYY-MM-DD). E.g. "Lun 14" */
export function formatDayLabelShort(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = DAY_NAMES_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1];
  return `${dayName} ${date.getDate()}`;
}

/** Returns "Semaine du DD MMM au DD MMM YYYY" */
export function formatWeekLabel(weekStart: string): string {
  const dates = getWeekDates(weekStart);
  const start = new Date(dates[0]);
  const end = new Date(dates[6]);
  const fmtShort = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const year = end.getFullYear();
  return `Semaine du ${fmtShort(start)} au ${fmtShort(end)} ${year}`;
}

/** Advance weekStart by `delta` weeks (can be negative). */
export function shiftWeek(weekStart: string, delta: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

/** Returns true if weekStart is the current week. */
export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getWeekStart(new Date());
}

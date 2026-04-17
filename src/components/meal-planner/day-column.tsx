import { MEAL_TYPE_DISPLAY_NAMES, type MealType } from '@backend/types';
import { cn, entries } from '@/lib/utils';
import { formatDayLabel, formatDayLabelShort } from '@/utils/week';
import { MealSlot, type MealSlotData } from './meal-slot';

interface DayColumnProps {
  date: string;
  meals: Partial<Record<MealType, MealSlotData>>;
  householdId: string;
  isToday: boolean;
}

export function DayColumn({
  date,
  meals,
  householdId,
  isToday,
}: DayColumnProps) {
  const mealTypes = entries(MEAL_TYPE_DISPLAY_NAMES);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border overflow-hidden transition-shadow',
        isToday
          ? 'border-primary/50 shadow-[0_0_0_2px_var(--primary)] shadow-primary/10'
          : 'border-border bg-card shadow-xs hover:shadow-sm',
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          'flex items-start justify-between gap-2 px-3 pt-3 pb-2.5 border-b',
          isToday
            ? 'bg-primary/8 border-primary/20'
            : 'bg-muted/30 border-border/60',
        )}
      >
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className={cn(
              'font-bold tracking-tight',
              isToday ? 'text-primary' : 'text-foreground',
            )}
          >
            <span className="hidden lg:inline">
              {formatDayLabel(date).split(' ')[0]}
            </span>
            <span className="lg:hidden">{formatDayLabelShort(date)}</span>
          </span>
          <span className="hidden lg:inline text-[11px] text-muted-foreground font-medium mt-0.5">
            {formatDayLabel(date).split(' ').slice(1).join(' ')}
          </span>
        </div>
        {isToday && (
          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Auj.
          </span>
        )}
      </div>

      {/* Meal slots */}
      <div
        className={cn(
          'flex flex-col flex-1 divide-y',
          isToday
            ? 'bg-primary/3 divide-primary/10'
            : 'bg-card divide-border/40',
        )}
      >
        {mealTypes.map(([type, label]) => (
          <MealSlot
            key={type}
            date={date}
            mealType={type}
            mealLabel={label}
            meal={meals[type] ?? null}
            householdId={householdId}
          />
        ))}
      </div>
    </div>
  );
}

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
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3',
        isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-card',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-sm font-semibold leading-tight',
            isToday ? 'text-primary' : 'text-foreground',
          )}
        >
          <span className="hidden lg:inline">{formatDayLabel(date)}</span>
          <span className="lg:hidden">{formatDayLabelShort(date)}</span>
        </span>
        {isToday && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            Aujourd'hui
          </span>
        )}
      </div>
      <div className="flex flex-col gap-8">
        {entries(MEAL_TYPE_DISPLAY_NAMES).map(([type, label]) => (
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

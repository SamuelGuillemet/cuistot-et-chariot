import { ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeTimeDisplayProps {
  readonly prepTime: number;
  readonly cookTime: number;
  readonly className?: string;
  /** One line: total time with the prep/cook split in muted text. */
  readonly compact?: boolean;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins}`;
}

export function RecipeTimeDisplay({
  prepTime,
  cookTime,
  className,
  compact = false,
}: RecipeTimeDisplayProps) {
  const totalTime = prepTime + cookTime;

  if (compact) {
    const split = [
      prepTime > 0 && `${formatTime(prepTime)} prép.`,
      cookTime > 0 && `${formatTime(cookTime)} cuisson`,
    ].filter(Boolean);
    return (
      <div className={cn('flex flex-wrap items-center gap-x-2 text-sm', className)}>
        <div className="flex items-center gap-1 font-medium">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(totalTime)}</span>
        </div>
        {split.length > 0 && <span className="text-muted-foreground">({split.join(' + ')})</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-3 text-sm', className)}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <ClockIcon className="w-4 h-4" />
        <span>Préparation: {formatTime(prepTime)}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <ClockIcon className="w-4 h-4" />
        <span>Cuisson: {formatTime(cookTime)}</span>
      </div>
      <div className="flex items-center gap-1 font-medium">
        <ClockIcon className="w-4 h-4" />
        <span>Total: {formatTime(totalTime)}</span>
      </div>
    </div>
  );
}

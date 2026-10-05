import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Step = { order: number; text: string };

interface RecipeInstructionsDisplayProps {
  readonly instructions: Step[];
  readonly className?: string;
}

export function RecipeInstructionsDisplay({
  instructions,
  className,
}: RecipeInstructionsDisplayProps) {
  const steps = useMemo(() => {
    return instructions.toSorted((a, b) => a.order - b.order).map((s) => s.text);
  }, [instructions]);

  // Local ephemeral progress per view
  const [progress, setProgress] = useState(() => ({
    stepCount: steps.length,
    completed: Array.from({ length: steps.length }, () => false),
  }));
  const completed = progress.stepCount === steps.length ? progress.completed : [];

  const toggle = (idx: number) => {
    setProgress((previous) => {
      const current =
        previous.stepCount === steps.length
          ? previous.completed
          : Array.from({ length: steps.length }, () => false);
      const next = [...current];
      next[idx] = !next[idx];
      return {
        stepCount: steps.length,
        completed: next,
      };
    });
  };

  return (
    <ol className={cn('space-y-3', className)}>
      {steps.map((text, idx) => {
        const isDone = completed[idx];
        return (
          <li key={`${idx}-${text.slice(0, 24)}`} className="group">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className={cn(
                'items-start gap-3 grid p-3 rounded-md w-full text-left transition-colors',
                'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}
              aria-pressed={isDone}
              aria-label={`Étape ${idx + 1}${isDone ? ' terminée' : ''}`}
            >
              <div className="relative mt-0.5">
                <span
                  className={cn(
                    'flex justify-center items-center border rounded-full size-6 font-semibold text-xs select-none shrink-0',
                    isDone
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-muted-foreground/30',
                  )}
                >
                  {idx + 1}
                </span>
              </div>
              <div
                className={cn('leading-relaxed', isDone && 'text-muted-foreground line-through')}
              >
                {text}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

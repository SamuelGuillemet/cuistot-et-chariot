import { useEffect, useMemo, useState } from 'react';
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
  // Normalize to an array of steps and strip any numeric prefixes ("1. ", "2) ", etc.)
  const steps = useMemo(() => {
    return instructions
      .toSorted((a, b) => a.order - b.order)
      .map((s) => s.text);
  }, [instructions]);

  // Local ephemeral progress per view
  const [completed, setCompleted] = useState<boolean[]>(() =>
    new Array(steps.length).fill(false),
  );

  // Reset when steps count changes
  useEffect(() => {
    setCompleted(new Array(steps.length).fill(false));
  }, [steps.length]);

  const toggle = (idx: number) => {
    setCompleted((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
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
                'items-start gap-3 grid grid-cols-[auto,1fr] p-3 rounded-md w-full text-left transition-colors',
                'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
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
                className={cn(
                  'leading-relaxed',
                  isDone && 'text-muted-foreground line-through',
                )}
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

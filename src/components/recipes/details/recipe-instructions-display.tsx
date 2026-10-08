import { useMemo, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = { order: number; text: string };

interface RecipeInstructionsDisplayProps {
  readonly instructions: Step[];
  /** Identifies the recipe so ticked steps survive a reload. */
  readonly recipeId: string;
  readonly className?: string;
}

const progressListeners = new Set<() => void>();

function subscribeToProgress(onChange: () => void) {
  progressListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    progressListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function parseProgress(raw: string): Set<number> {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : []);
  } catch {
    return new Set();
  }
}

/** Ticked step orders for a recipe, kept in localStorage. */
function useStepProgress(recipeId: string) {
  const key = `recipe-progress-${recipeId}`;
  const raw = useSyncExternalStore(
    subscribeToProgress,
    () => localStorage.getItem(key) ?? '',
    () => '',
  );
  const completed = useMemo(() => parseProgress(raw), [raw]);

  const save = (next: Set<number>) => {
    if (next.size === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify([...next]));
    progressListeners.forEach((listener) => listener());
  };

  return {
    completed,
    toggle: (order: number) => {
      const next = new Set(completed);
      if (!next.delete(order)) next.add(order);
      save(next);
    },
    reset: () => save(new Set()),
  };
}

export function RecipeInstructionsDisplay({
  instructions,
  recipeId,
  className,
}: RecipeInstructionsDisplayProps) {
  const steps = useMemo(() => {
    return instructions.toSorted((a, b) => a.order - b.order);
  }, [instructions]);
  const { completed, toggle, reset } = useStepProgress(recipeId);
  const doneCount = steps.filter((step) => completed.has(step.order)).length;

  return (
    <div className="space-y-3">
      {doneCount > 0 && (
        <div className="flex justify-between items-center gap-2 text-muted-foreground text-sm">
          <span>
            {doneCount} / {steps.length} étapes terminées
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Tout décocher
          </Button>
        </div>
      )}
      <ol className={cn('space-y-3', className)}>
        {steps.map((step, idx) => {
          const isDone = completed.has(step.order);
          return (
            <li key={step.order} className="group">
              <button
                type="button"
                onClick={() => toggle(step.order)}
                className={cn(
                  'items-start gap-3 grid p-3 rounded-md w-full text-left transition-colors',
                  'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}
                aria-pressed={isDone}
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
                  {step.text}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

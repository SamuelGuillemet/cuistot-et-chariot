import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type StepItem = { order: number; text: string };

interface RecipeInstructionsEditorProps {
  readonly value: StepItem[];
  readonly onChange: (value: StepItem[]) => void;
  readonly error?: boolean;
  readonly placeholder?: string;
}

export function RecipeInstructionsEditor({
  value,
  onChange,
  error,
  placeholder = 'Décrivez les étapes de la recette...',
}: RecipeInstructionsEditorProps) {
  const updateStep = (index: number, text: string) => {
    const newSteps = value.map((s, i) => (i === index ? { ...s, text } : s));
    emitChanges(newSteps);
  };

  const addStep = () => {
    const copy = [...value];
    copy.push({ order: 0, text: '' });
    emitChanges(copy);
  };

  const removeStep = (index: number) => {
    const copy = [...value];
    copy.splice(index, 1);
    emitChanges(copy);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const copy = [...value];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    emitChanges(copy);
  };

  const emitChanges = (newSteps: StepItem[]) => {
    onChange(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <div className={cn('space-y-3', error && 'border-destructive')}>
      <div className="space-y-2">
        {value.map((step, index) => (
          <div
            key={step.order}
            className="items-start gap-2 grid grid-cols-[auto,1fr,auto] bg-accent/40 p-2 border rounded-md"
          >
            <div className="flex justify-center items-center bg-background border rounded-full size-7 font-semibold text-xs shrink-0">
              {step.order}
            </div>

            <Textarea
              value={step.text}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder={index === 0 ? placeholder : `Étape ${index + 1}…`}
              rows={2}
              className="resize-y"
            />

            <div className="flex self-stretch gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveStep(index, 'up')}
              >
                <ArrowUpIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveStep(index, 'down')}
              >
                <ArrowDownIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addStep()}
      >
        <PlusIcon className="mr-2 size-4" />
        Ajouter une étape
      </Button>
    </div>
  );
}

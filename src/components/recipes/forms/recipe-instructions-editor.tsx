import { useSelector } from '@tanstack/react-form';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { BaseField, isFieldInvalid } from '@/components/forms/base-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RecipeFormApi } from './recipe-form';

export function InstructionsFieldArray({ form }: { readonly form: RecipeFormApi }) {
  const count = useSelector(form.store, (state) => state.values.instructions.length);

  return (
    <form.AppField name="instructions" mode="array">
      {(field) => {
        // `order` is persisted by the backend and must always match the position in the list.
        const renumber = () => {
          field.state.value.forEach((step, index) => {
            if (step.order !== index + 1) {
              field.replaceValue(index, { ...step, order: index + 1 });
            }
          });
        };
        const onMove = (index: number, newIndex: number) => {
          field.swapValues(index, newIndex);
          renumber();
        };
        const onRemove = (index: number) => {
          field.removeValue(index);
          renumber();
        };
        const onAdd = () => {
          field.pushValue({ order: field.state.value.length + 1, text: '' });
          // Scroll to the newly added instruction row (optional)
          setTimeout(() => {
            const element = document.querySelector(`#instructions-${field.state.value.length - 1}`);
            if (element) (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
          }, 0);
        };

        return (
          <Card className={cn('lg:flex-1 lg:min-h-0', isFieldInvalid(field) && 'ring-destructive')}>
            <CardHeader>
              <CardTitle>Étapes</CardTitle>
              <CardDescription>
                {count === 0 ? 'Décrivez la préparation pas à pas.' : `${count} étape(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto py-1">
              <BaseField field={field}>
                {count === 0 ? (
                  <p className="py-6 border border-dashed rounded-md text-muted-foreground text-sm text-center">
                    Aucune étape ajoutée.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: count }, (_, index) => (
                      <InstructionRow
                        key={index}
                        form={form}
                        index={index}
                        onMoveUp={index > 0 ? () => onMove(index, index - 1) : undefined}
                        onMoveDown={index < count - 1 ? () => onMove(index, index + 1) : undefined}
                        onRemove={() => onRemove(index)}
                      />
                    ))}
                  </div>
                )}
              </BaseField>
            </CardContent>
            <CardFooter className="p-2">
              <Button type="button" variant="ghost" onClick={onAdd} className="w-full">
                <PlusIcon /> Ajouter une étape
              </Button>
            </CardFooter>
          </Card>
        );
      }}
    </form.AppField>
  );
}

function InstructionRow({
  form,
  index,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  readonly form: RecipeFormApi;
  readonly index: number;
  readonly onMoveUp?: () => void;
  readonly onMoveDown?: () => void;
  readonly onRemove: () => void;
}) {
  const step = index + 1;

  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
      <div className="flex justify-center items-center bg-primary/10 mt-1 rounded-full size-7 font-semibold text-primary text-xs shrink-0">
        {step}
      </div>

      <div className="flex-1 min-w-0" id={`instructions-${index}`}>
        <form.AppField name={`instructions[${index}].text`}>
          {(field) => (
            <field.TextareaField
              aria-label={`Étape ${step}`}
              rows={2}
              placeholder={step === 1 ? 'Décrivez les étapes de la recette...' : `Étape ${step}…`}
              className="resize-y"
            />
          )}
        </form.AppField>
      </div>

      <div className="flex justify-end gap-0.5 max-sm:basis-full">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Monter"
          onClick={onMoveUp}
          disabled={!onMoveUp}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Descendre"
          onClick={onMoveDown}
          disabled={!onMoveDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Supprimer l'étape"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

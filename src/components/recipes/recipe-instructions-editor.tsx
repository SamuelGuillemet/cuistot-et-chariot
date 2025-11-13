import { useStore } from '@tanstack/react-form';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { type AppForm, withFieldGroup } from '@/hooks/use-app-form';
import { cn } from '@/lib/utils';
import { BaseFieldComposer } from '../forms/base-field';
import { Button } from '../ui/button';
import type { Recipe } from './recipe-form';

export function InstructionsFieldArray({
  form,
}: {
  readonly form: AppForm<Recipe>;
}) {
  return (
    <form.AppField name="instructions" mode="array">
      {(field) => {
        const updateOrders = () => {
          field.state.value.forEach((step, index) => {
            if (step.order !== index + 1) {
              field.replaceValue(index, { ...step, order: index + 1 });
            }
          });
        };
        const onMove = (index: number, newIndex: number) => {
          field.swapValues(index, newIndex);
          updateOrders();
        };
        const onRemove = (index: number) => {
          field.removeValue(index);
          updateOrders();
        };
        const onAdd = () => {
          field.pushValue({ order: field.state.value.length + 1, text: '' });
          updateOrders();
        };

        return (
          <BaseFieldComposer.Root
            field={field}
            required
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <BaseFieldComposer.Label>
                Etapes de la recette
              </BaseFieldComposer.Label>
              <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                <PlusIcon className="mr-2 w-4 h-4" /> Ajouter une étape
              </Button>
            </div>
            <BaseFieldComposer.Control>
              {({ isInvalid }) => (
                <div className="flex flex-col gap-4">
                  {field.state.value.length === 0 ? (
                    <p
                      className={cn(
                        'py-4 border rounded-md text-muted-foreground text-sm text-center',
                        isInvalid && 'border-destructive',
                      )}
                    >
                      Aucune instruction ajoutée.
                    </p>
                  ) : (
                    field.state.value.map((step, index) => (
                      <InstructionsFormFields
                        key={`${step.order}-${index}`}
                        form={form}
                        fields={`instructions[${index}]`}
                        onMoveUp={() => onMove(index, index - 1)}
                        onMoveDown={() => onMove(index, index + 1)}
                        onRemove={() => onRemove(index)}
                        canMoveUp={index > 0}
                        canMoveDown={index < field.state.value.length - 1}
                      />
                    ))
                  )}
                </div>
              )}
            </BaseFieldComposer.Control>
            <BaseFieldComposer.Error />
          </BaseFieldComposer.Root>
        );
      }}
    </form.AppField>
  );
}

const InstructionsFormFields = withFieldGroup({
  defaultValues: {
    order: 0,
    text: '',
  } as Recipe['instructions'][number],
  props: {
    onRemove: (() => {}) as () => void,
    onMoveUp: (() => {}) as () => void,
    onMoveDown: (() => {}) as () => void,
    canMoveUp: true,
    canMoveDown: true,
  },
  render: ({ group, ...props }) => {
    const { onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown } = props;

    const order = useStore(group.store, (state) => state.values.order);

    const placeholder =
      order === 1 ? 'Décrivez les étapes de la recette...' : `Étape ${order}…`;

    return (
      <div className="items-start gap-2 grid grid-cols-[auto,1fr,auto] bg-accent/40 p-2 border rounded-md">
        <div className="flex justify-center items-center bg-background border rounded-full size-7 font-semibold text-xs shrink-0">
          {order}
        </div>

        <group.AppField name="text">
          {(field) => (
            <field.TextareaField
              label=""
              rows={2}
              placeholder={placeholder}
              className="resize-y"
            />
          )}
        </group.AppField>

        <div className="flex self-stretch gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ArrowUpIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ArrowDownIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>
    );
  },
});

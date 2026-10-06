import { PRODUCT_UNITS, type ProductUnit, RECIPE_DIFFICULTY_DISPLAY_NAMES } from '@backend/types';
import { useSelector } from '@tanstack/react-form';
import * as v from 'valibot';
import { DraftBanner } from '@/components/forms/draft-banner';
import { UnsavedChangesGuard } from '@/components/forms/unsaved-changes-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { handleSubmitInvalid, useAppForm } from '@/hooks/use-app-form';
import { useFormDraft } from '@/hooks/use-form-draft';
import { typedEnum } from '@/utils/valibot';
import { RecipeImport } from './recipe-import';
import { ProductsFieldArray } from './recipe-ingredients-editor';
import { InstructionsFieldArray } from './recipe-instructions-editor';

const Recipe = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Le nom est requis'),
    v.maxLength(100, 'Le nom est trop long'),
  ),
  instructions: v.pipe(
    v.array(
      v.object({
        order: v.number(),
        text: v.pipe(v.string(), v.minLength(1, 'Chaque étape doit contenir du texte')),
      }),
    ),
    v.minLength(0, 'Ajoutez au moins une étape'),
  ),
  servings: v.pipe(
    v.number('Le champ est obligatoire'),
    v.minValue(1, 'Au moins 1 portion'),
    v.maxValue(50, 'Maximum 50 portions'),
  ),
  prepTime: v.pipe(
    v.number('Le champ est obligatoire'),
    v.minValue(0, 'Le temps de préparation doit être positif'),
  ),
  cookTime: v.pipe(
    v.number('Le champ est obligatoire'),
    v.minValue(0, 'Le temps de cuisson doit être positif'),
  ),
  difficulty: typedEnum(RECIPE_DIFFICULTY_DISPLAY_NAMES, 'Difficulté requise'),
  products: v.pipe(
    v.array(
      v.object({
        productId: v.pipe(v.string(), v.minLength(1, 'Sélectionnez un produit')),
        quantity: v.pipe(
          v.number('Le champ est obligatoire'),
          v.minValue(0.01, 'La quantité doit être positive'),
        ),
        unit: typedEnum(PRODUCT_UNITS, 'Unité requise'),
      }),
    ),
    v.minLength(0, 'Ajoutez au moins un ingrédient'),
  ),
});

export type Recipe = v.InferOutput<typeof Recipe>;

/** Imported ingredient line, kept on the row until the user picks the matching product. */
interface IngredientHint {
  name: string;
  unit: ProductUnit | null;
  productIds: string[];
}

type RecipeFormValues = Omit<Recipe, 'products'> & {
  products: (Recipe['products'][number] & { hint?: IngredientHint })[];
};

interface RecipeFormProps {
  readonly onSubmit: (values: Recipe) => void | Promise<void>;
  readonly allowImport?: boolean;
  readonly isLoading?: boolean;
  readonly recipe?: Recipe;
  readonly submitText?: string;
  readonly recipeId?: string;
}

function useRecipeForm({
  recipe,
  recipeId,
  onSubmit,
}: Pick<RecipeFormProps, 'recipe' | 'recipeId' | 'onSubmit'>) {
  const draft = useFormDraft<RecipeFormValues>(recipeId ?? 'recipe-new');

  // Pick fields explicitly: `recipe` may come from the API with extra properties.
  const defaultValues: RecipeFormValues = {
    name: recipe?.name ?? '',
    instructions: recipe?.instructions ?? [],
    servings: recipe?.servings ?? 4,
    prepTime: recipe?.prepTime ?? 0,
    cookTime: recipe?.cookTime ?? 0,
    difficulty: recipe?.difficulty ?? 'easy',
    products:
      recipe?.products.map(({ productId, quantity, unit }) => ({ productId, quantity, unit })) ??
      [],
  };

  const form = useAppForm({
    defaultValues,
    validators: { onChange: Recipe },
    listeners: {
      onChange: ({ formApi }) => {
        if (formApi.state.isDefaultValue) draft.clear();
        else draft.save(formApi.state.values);
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        products: value.products.map(({ productId, quantity, unit }) => ({
          productId,
          quantity,
          unit,
        })),
      });
      draft.clear();
    },
    onSubmitInvalid: handleSubmitInvalid,
  });

  return { form, draft };
}

export type RecipeFormApi = ReturnType<typeof useRecipeForm>['form'];

export function RecipeForm({
  isLoading = false,
  submitText = 'Créer la recette',
  allowImport = false,
  ...props
}: RecipeFormProps) {
  const { form, draft } = useRecipeForm(props);
  const isDefaultValue = useSelector(form.store, (state) => state.isDefaultValue);
  const draftValues = draft.values;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6 lg:flex-1 lg:min-h-0"
    >
      <UnsavedChangesGuard when={!isDefaultValue && !isLoading} />

      {draftValues && isDefaultValue && (
        <DraftBanner
          onRestore={() => form.reset(draftValues, { keepDefaultValues: true })}
          onDiscard={draft.clear}
        />
      )}

      {allowImport && (
        <RecipeImport
          disabled={isLoading}
          confirmOverwrite={!isDefaultValue}
          onImport={(imported) =>
            form.reset(
              {
                name: imported.name,
                instructions: imported.steps.map((text, index) => ({ order: index + 1, text })),
                servings: Math.min(50, Math.max(1, imported.people || 4)),
                prepTime: imported.prepTime,
                cookTime: imported.cookTime,
                difficulty: imported.difficulty,
                products: imported.ingredients.map(({ name, quantity, unit, productIds }) => ({
                  productId: '',
                  quantity: quantity || 1,
                  unit: unit ?? 'pieces',
                  hint: { name, unit, productIds },
                })),
              },
              { keepDefaultValues: true },
            )
          }
        />
      )}

      <div className="gap-6 grid lg:grid-cols-5 lg:grid-rows-1 lg:flex-1 lg:min-h-0 px-2">
        <div className="flex flex-col gap-6 lg:col-span-3 lg:min-h-0">
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <form.AppField name="name">
                  {(field) => (
                    <field.TextField
                      label="Nom de la recette"
                      placeholder="Ex: Tarte aux pommes"
                      required
                    />
                  )}
                </form.AppField>

                <div className="items-start gap-4 grid grid-cols-2 sm:grid-cols-4">
                  <form.AppField name="servings">
                    {(field) => (
                      <field.NumberField
                        label="Portions"
                        placeholder="4"
                        required
                        min={1}
                        max={50}
                        step={1}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="difficulty">
                    {(field) => (
                      <field.SelectField
                        label="Difficulté"
                        placeholder="Sélectionner"
                        options={RECIPE_DIFFICULTY_DISPLAY_NAMES}
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="prepTime">
                    {(field) => (
                      <field.NumberField
                        label="Préparation (min)"
                        placeholder="15"
                        min={0}
                        step={1}
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="cookTime">
                    {(field) => (
                      <field.NumberField
                        label="Cuisson (min)"
                        placeholder="30"
                        min={0}
                        step={1}
                        required
                      />
                    )}
                  </form.AppField>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <InstructionsFieldArray form={form} />
        </div>

        <div className="flex flex-col lg:col-span-2 lg:min-h-0">
          <ProductsFieldArray form={form} />
        </div>
      </div>

      <div className="bottom-0 z-10 sticky flex justify-end flex-col-reverse sm:flex-row gap-2 bg-background py-3 border-t">
        <form.AppForm>
          <form.ResetButton isLoading={isLoading} />
          <form.SubmitButton label={submitText} isLoading={isLoading} />
        </form.AppForm>
      </div>
    </form>
  );
}

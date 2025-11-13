import { PRODUCT_UNITS, RECIPE_DIFFICULTY_DISPLAY_NAMES } from 'convex/types';
import * as v from 'valibot';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/hooks/use-app-form';
import { typedEnum } from '@/utils/valibot';
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
        text: v.pipe(
          v.string(),
          v.minLength(1, 'Chaque étape doit contenir du texte'),
        ),
      }),
    ),
    v.minLength(1, 'Ajoutez au moins une étape'),
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
        productId: v.pipe(
          v.string(),
          v.minLength(1, 'Sélectionnez un produit'),
        ),
        quantity: v.pipe(
          v.number('Le champ est obligatoire'),
          v.minValue(0.01, 'La quantité doit être positive'),
        ),
        unit: typedEnum(PRODUCT_UNITS, 'Unité requise'),
      }),
    ),
    v.minLength(1, 'Ajoutez au moins un ingrédient'),
  ),
});

export type Recipe = v.InferOutput<typeof Recipe>;

interface RecipeFormProps {
  readonly onSubmit: (values: Recipe) => void;
  readonly isLoading?: boolean;
  readonly defaultValues?: Partial<Recipe>;
  readonly submitText?: string;
  readonly householdId: string;
}

const fakeData = Array.from({ length: 100 }).map((_, index) => ({
  _id: `product-${index + 1}`,
  icon: 'apple',
  name: `Produit ${index + 1}`,
}));
export function RecipeForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitText = 'Créer la recette',
  householdId,
}: Readonly<RecipeFormProps>) {
  const form = useAppForm<Recipe>({
    defaultValues: {
      name: '',
      instructions: [],
      servings: 4,
      prepTime: 0,
      cookTime: 0,
      difficulty: 'easy',
      products: [],
    },
    initialValues: defaultValues,
    validator: {
      validateFn: Recipe,
      validateOn: ['onChange'],
    },
    onSubmit,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
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
      </FieldGroup>

      <FieldGroup>
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
              placeholder="Sélectionner une difficulté"
              options={RECIPE_DIFFICULTY_DISPLAY_NAMES}
              required
            />
          )}
        </form.AppField>
      </FieldGroup>

      <FieldGroup>
        <form.AppField name="prepTime">
          {(field) => (
            <field.NumberField
              label="Temps de préparation (min)"
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
              label="Temps de cuisson (min)"
              placeholder="30"
              min={0}
              step={1}
              required
            />
          )}
        </form.AppField>
      </FieldGroup>

      <InstructionsFieldArray form={form} />

      <ProductsFieldArray form={form} householdId={householdId} />

      <div className="flex justify-end gap-2 pt-2">
        <form.AppForm>
          <form.ResetButton isLoading={isLoading} />
          <form.SubmitButton label={submitText} isLoading={isLoading} />
        </form.AppForm>
      </div>
    </form>
  );
}

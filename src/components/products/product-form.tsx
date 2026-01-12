import { CATEGORY_DISPLAY_NAMES, PRODUCT_UNITS } from '@backend/types';
import * as v from 'valibot';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/hooks/use-app-form';
import { typedEnum } from '@/utils/valibot';

const Product = v.object({
  icon: v.pipe(v.string(), v.minLength(1, 'Veuillez sélectionner une icône')),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Le nom est requis'),
    v.maxLength(100, 'Le nom est trop long'),
  ),
  description: v.optional(
    v.pipe(v.string(), v.maxLength(500, 'La description est trop longue')),
  ),
  category: typedEnum(CATEGORY_DISPLAY_NAMES, 'Catégorie requise'),
  defaultUnit: typedEnum(PRODUCT_UNITS, 'Unité par défaut requise'),
});

export type Product = v.InferOutput<typeof Product>;

interface ProductFormProps {
  readonly onSubmit: (values: Product) => void;
  readonly isLoading?: boolean;
  readonly defaultValues?: Partial<Product>;
  readonly submitText?: string;
}

export function ProductForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitText = 'Créer le produit',
}: Readonly<ProductFormProps>) {
  const form = useAppForm<Product>({
    defaultValues: {
      icon: '',
      name: '',
      description: '',
      category: 'other',
      defaultUnit: 'pieces',
    },
    initialValues: defaultValues,
    validator: {
      validateFn: Product,
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
        <form.AppField name="icon">
          {(field) => <field.IconField label="Icône" required />}
        </form.AppField>
      </FieldGroup>
      <FieldGroup>
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Nom"
              placeholder="Nom du produit"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Description"
              placeholder="Description du produit (optionnel)"
            />
          )}
        </form.AppField>
      </FieldGroup>
      <FieldGroup>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Catégorie"
              placeholder="Sélectionner une catégorie"
              options={CATEGORY_DISPLAY_NAMES}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="defaultUnit">
          {(field) => (
            <field.SelectField
              label="Unité par défaut"
              placeholder="Sélectionner une unité"
              options={PRODUCT_UNITS}
              required
            />
          )}
        </form.AppField>
      </FieldGroup>
      <div className="flex justify-end gap-2 pt-2">
        <form.AppForm>
          <form.ResetButton isLoading={isLoading} />
          <form.SubmitButton label={submitText} isLoading={isLoading} />
        </form.AppForm>
      </div>
    </form>
  );
}

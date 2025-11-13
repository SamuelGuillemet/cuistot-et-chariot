import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { PRODUCT_UNITS } from 'convex/types';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { type AppForm, withFieldGroup } from '@/hooks/use-app-form';
import { cn } from '@/lib/utils';
import { getIconClass } from '../food-icons/icon-food-font-config';
import { BaseField, BaseFieldComposer } from '../forms/base-field';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import type { Recipe } from './recipe-form';

type Product = FunctionReturnType<
  typeof api.products.queries.getProducts
>[number];

export function ProductsFieldArray({
  form,
  householdId,
}: {
  readonly form: AppForm<Recipe>;
  readonly householdId: string;
}) {
  const { data: availableProducts = [] } = useSuspenseQuery(
    convexQuery(api.products.queries.getProducts, { publicId: householdId }),
  );

  return (
    <form.AppField name="products" mode="array">
      {(field) => (
        <BaseFieldComposer.Root
          field={field}
          required
          className="flex flex-col gap-4"
        >
          <div className="flex justify-between items-center">
            <BaseFieldComposer.Label>Ingrédients</BaseFieldComposer.Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                field.pushValue({ productId: '', quantity: 1, unit: 'pieces' })
              }
            >
              <PlusIcon className="mr-2 w-4 h-4" /> Ajouter un ingrédient
            </Button>
          </div>
          <BaseFieldComposer.Control>
            {({ isInvalid }) => (
              <div
                className={cn(
                  'flex flex-col gap-4 bg-accent/50 p-4 border rounded-md',
                  isInvalid && 'border-destructive',
                )}
              >
                {field.state.value.length === 0 ? (
                  <p className="py-4 text-muted-foreground text-sm text-center">
                    Aucun ingrédient ajouté.
                  </p>
                ) : (
                  field.state.value.map((product, index) => (
                    <>
                      <ProductFormFields
                        key={`${product.productId}-${index}`}
                        form={form}
                        fields={`products[${index}]`}
                        products={availableProducts}
                        onRemove={() => field.removeValue(index)}
                      />
                      {index < field.state.value.length - 1 && <Separator />}
                    </>
                  ))
                )}
              </div>
            )}
          </BaseFieldComposer.Control>
          <BaseFieldComposer.Error />
        </BaseFieldComposer.Root>
      )}
    </form.AppField>
  );
}

const ProductFormFields = withFieldGroup({
  defaultValues: {
    productId: '',
    quantity: 1,
    unit: 'pieces',
  } as Recipe['products'][number],
  props: {
    products: [] as Product[],
    onRemove: (() => {}) as () => void,
  },
  render: ({ group, ...props }) => {
    const { products, onRemove } = props;

    const setDefaultUnit = (value: string) => {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct?.defaultUnit) {
        group.setFieldValue('unit', selectedProduct.defaultUnit);
      }
    };

    return (
      <div className="items-start gap-2 grid grid-cols-12">
        <div className="col-span-6">
          <group.AppField name="productId">
            {(field) => (
              <BaseField label="Produit" required field={field}>
                {({ isInvalid }) => (
                  <Select
                    aria-invalid={isInvalid}
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setDefaultUnit(value);
                    }}
                    showClearButton
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                    >
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          <i className={cn(getIconClass(p.icon), 'mr-2')} />
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </BaseField>
            )}
          </group.AppField>
        </div>

        <div className="col-span-2">
          <group.AppField name="quantity">
            {(field) => (
              <field.NumberField
                label="Quantité"
                placeholder="1"
                required
                min={0.1}
                step={0.1}
              />
            )}
          </group.AppField>
        </div>

        <div className="col-span-3">
          <group.AppField name="unit">
            {(field) => (
              <field.SelectField
                label="Unité"
                options={PRODUCT_UNITS}
                required
              />
            )}
          </group.AppField>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove()}
          className="justify-self-end self-start col-span-1 border border-destructive/50 rounded-full text-destructive hover:text-destructive"
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    );
  },
});

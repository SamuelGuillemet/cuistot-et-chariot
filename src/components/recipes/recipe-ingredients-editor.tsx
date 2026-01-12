import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { PRODUCT_UNITS } from 'convex/types';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import { type AppForm, withFieldGroup } from '@/hooks/use-app-form';
import { cn } from '@/lib/utils';
import { BaseField, BaseFieldComposer } from '../forms/base-field';
import { ProductSelector } from '../products/product-selector';
import { Button } from '../ui/button';
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
          className="flex flex-col gap-2"
        >
          <BaseFieldComposer.Label>Ingrédients</BaseFieldComposer.Label>
          <BaseFieldComposer.Control>
            {({ isInvalid }) => (
              <div
                className={cn(
                  'flex flex-col gap-4 p-4 border rounded-md',
                  isInvalid && 'border-destructive',
                )}
              >
                {field.state.value.length === 0 ? (
                  <p className="py-4 text-sm text-center">
                    Aucun ingrédient ajouté.
                  </p>
                ) : (
                  field.state.value.map((_, index) => (
                    <Fragment key={index}>
                      <ProductFormFields
                        form={form}
                        fields={`products[${index}]`}
                        products={availableProducts}
                        onRemove={() => field.removeValue(index)}
                      />
                      {index < field.state.value.length - 1 && <Separator />}
                    </Fragment>
                  ))
                )}
              </div>
            )}
          </BaseFieldComposer.Control>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              field.pushValue({ productId: '', quantity: 1, unit: 'pieces' })
            }
            className="w-full"
          >
            <PlusIcon className="mr-2 w-4 h-4" /> Ajouter un ingrédient
          </Button>
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
                  <ProductSelector
                    products={products}
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value);
                      setDefaultUnit(value);
                    }}
                    onBlur={field.handleBlur}
                    isInvalid={isInvalid}
                  />
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

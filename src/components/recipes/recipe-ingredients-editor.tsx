import { api } from '@api/api';
import { PRODUCT_UNITS } from '@backend/types';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseField, isFieldInvalid } from '../forms/base-field';
import { ProductSelector } from '../products/product-selector';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import type { RecipeFormApi } from './recipe-form';

type Product = FunctionReturnType<typeof api.products.queries.getProducts>[number];

export function ProductsFieldArray({ form }: { readonly form: RecipeFormApi }) {
  const { data: availableProducts } = useSuspenseQuery(
    convexQuery(api.products.queries.getProducts, {}),
  );

  return (
    <form.AppField name="products" mode="array">
      {(field) => {
        const count = field.state.value.length;
        return (
          <Card className={cn('lg:flex-1 lg:min-h-0', isFieldInvalid(field) && 'ring-destructive')}>
            <CardHeader>
              <CardTitle>Ingrédients</CardTitle>
              <CardDescription>
                {count === 0 ? 'Ajoutez les produits nécessaires.' : `${count} ingrédient(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto py-1">
              <BaseField field={field}>
                {count === 0 ? (
                  <p className="py-6 border border-dashed rounded-md text-muted-foreground text-sm text-center">
                    Aucun ingrédient ajouté.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {field.state.value.map((_, index) => (
                      <IngredientRow
                        key={index}
                        form={form}
                        index={index}
                        products={availableProducts}
                        onRemove={() => field.removeValue(index)}
                      />
                    ))}
                  </div>
                )}
              </BaseField>
            </CardContent>
            <CardFooter className="p-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => field.pushValue({ productId: '', quantity: 1, unit: 'pieces' })}
                className="w-full"
              >
                <PlusIcon /> Ajouter un ingrédient
              </Button>
            </CardFooter>
          </Card>
        );
      }}
    </form.AppField>
  );
}

function IngredientRow({
  form,
  index,
  products,
  onRemove,
}: {
  readonly form: RecipeFormApi;
  readonly index: number;
  readonly products: Product[];
  readonly onRemove: () => void;
}) {
  return (
    <div className="relative items-start gap-3 grid grid-cols-2 p-3 border rounded-lg">
      <div className="col-span-2">
        <form.AppField name={`products[${index}].productId`}>
          {(field) => (
            <BaseField label="Produit" required field={field}>
              <ProductSelector
                products={products}
                value={field.state.value}
                onChange={(productId) => {
                  field.handleChange(productId);
                  const defaultUnit = products.find((p) => p._id === productId)?.defaultUnit;
                  if (defaultUnit) form.setFieldValue(`products[${index}].unit`, defaultUnit);
                }}
                onBlur={field.handleBlur}
                isInvalid={isFieldInvalid(field)}
              />
            </BaseField>
          )}
        </form.AppField>
      </div>

      <form.AppField name={`products[${index}].quantity`}>
        {(field) => (
          <field.NumberField label="Quantité" placeholder="1" required min={0.1} step={0.1} />
        )}
      </form.AppField>

      <form.AppField name={`products[${index}].unit`}>
        {(field) => <field.SelectField label="Unité" options={PRODUCT_UNITS} required />}
      </form.AppField>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Supprimer l'ingrédient"
        onClick={onRemove}
        className="top-2 right-2 absolute text-destructive hover:text-destructive"
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

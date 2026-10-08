import { api } from '@api/api';
import { PRODUCT_UNITS } from '@backend/types';
import { convexQuery } from '@convex-dev/react-query';
import { useSelector } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { BaseField, isFieldInvalid } from '@/components/forms/base-field';
import { ProductSelector } from '@/components/products/product-selector';
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

type Product = FunctionReturnType<typeof api.products.queries.getProducts>[number];

export function ProductsFieldArray({ form }: { readonly form: RecipeFormApi }) {
  const { data: availableProducts } = useSuspenseQuery(
    convexQuery(api.products.queries.getProducts, {}),
  );
  const count = useSelector(form.store, (state) => state.values.products.length);
  const unmatchedCount = useSelector(
    form.store,
    (state) => state.values.products.filter((row) => row.hint && !row.productId).length,
  );

  const onAddIngredient = () => {
    form.setFieldValue(`products[${count}]`, { productId: '', quantity: 1, unit: 'pieces' });
    // Scroll to the newly added ingredient row (optional)
    setTimeout(() => {
      const element = document.querySelector(`#products-${count}`);
      if (element) (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <form.AppField name="products" mode="array">
      {(field) => (
        <Card className={cn('lg:flex-1 lg:min-h-0', isFieldInvalid(field) && 'ring-destructive')}>
          <CardHeader>
            <CardTitle>Ingrédients</CardTitle>
            <CardDescription>
              {count === 0 ? 'Ajoutez les produits nécessaires.' : `${count} ingrédient(s)`}
              {unmatchedCount > 0 && ` · ${unmatchedCount} à associer`}
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
                  {Array.from({ length: count }, (_, index) => (
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
            <Button type="button" variant="ghost" onClick={onAddIngredient} className="w-full">
              <PlusIcon /> Ajouter un ingrédient
            </Button>
          </CardFooter>
        </Card>
      )}
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
  const hint = useSelector(form.store, (state) => state.values.products[index]?.hint);

  return (
    <div
      className="items-start gap-3 grid grid-cols-2 p-3 border rounded-lg"
      id={`products-${index}`}
    >
      <div className="flex justify-between items-center gap-2 col-span-2">
        <p className="min-w-0 font-medium text-sm truncate">
          {hint ? (
            <>
              <span className="font-normal text-muted-foreground">Ingrédient : </span>
              {hint.name}
            </>
          ) : (
            `Ingrédient ${index + 1}`
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Supprimer l'ingrédient"
          onClick={onRemove}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2Icon />
        </Button>
      </div>

      <div className="col-span-2">
        <form.AppField name={`products[${index}].productId`}>
          {(field) => (
            <BaseField label="Produit" required field={field}>
              <ProductSelector
                products={products}
                value={field.state.value}
                hint={hint}
                onChange={(productId, defaultUnit) => {
                  field.handleChange(productId);
                  // Keep the unit parsed from an imported recipe.
                  if (!hint?.unit) form.setFieldValue(`products[${index}].unit`, defaultUnit);
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
    </div>
  );
}

import type { Doc } from 'convex/_generated/dataModel';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeProductItem } from './recipe-product-item';
import { ServingAdjuster } from './serving-adjuster';

interface RecipeProductsListProps {
  readonly recipeProducts: (Doc<'recipeProducts'> & {
    readonly product: Doc<'products'> | null;
  })[];
  readonly originalServings?: number;
}

export function RecipeProductsList({
  recipeProducts,
  originalServings,
}: RecipeProductsListProps) {
  const [currentServings, setCurrentServings] = useState(originalServings ?? 1);

  const ratio = originalServings ? currentServings / originalServings : 1;
  const showAdjustment = currentServings !== originalServings;

  if (recipeProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingrédients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center">
            Aucun ingrédient pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingrédients ({recipeProducts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {originalServings && (
          <ServingAdjuster
            originalServings={originalServings}
            currentServings={currentServings}
            onServingsChange={setCurrentServings}
          />
        )}

        <div className="space-y-1">
          {recipeProducts.map((rp) => (
            <RecipeProductItem
              key={rp._id}
              recipeProduct={rp}
              adjustedQuantity={
                showAdjustment
                  ? Number((rp.quantity * ratio).toFixed(2))
                  : undefined
              }
              showOriginal={showAdjustment}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import type { Doc } from '@api/dataModel';
import { PRODUCT_UNITS } from '@backend/types';
import { cn } from '@/lib/utils';
import { getIconClass } from '../food-icons/icon-food-font-config';

interface RecipeProductItemProps {
  readonly recipeProduct: Doc<'recipeProducts'> & {
    readonly product: Doc<'products'> | null;
  };
  readonly adjustedQuantity?: number;
  readonly showOriginal?: boolean;
}

export function RecipeProductItem({
  recipeProduct,
  adjustedQuantity,
  showOriginal = false,
}: RecipeProductItemProps) {
  if (!recipeProduct.product) {
    return null;
  }

  const displayQuantity = adjustedQuantity ?? recipeProduct.quantity;
  const hasAdjustment =
    adjustedQuantity !== undefined &&
    adjustedQuantity !== recipeProduct.quantity;

  return (
    <div className="group relative flex items-center gap-3 hover:bg-accent/50 p-3 rounded-lg transition-colors">
      <i
        className={cn(getIconClass(recipeProduct.product?.icon), 'text-3xl')}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-primary text-base">
            {displayQuantity}
          </span>
          <span className="text-muted-foreground text-sm">
            {PRODUCT_UNITS[recipeProduct.unit]}
          </span>
        </div>
        <p className="font-medium text-sm truncate">
          {recipeProduct.product.name}
        </p>
        {hasAdjustment && showOriginal && (
          <p className="text-muted-foreground text-xs italic">
            (original: {recipeProduct.quantity}{' '}
            {PRODUCT_UNITS[recipeProduct.unit]})
          </p>
        )}
      </div>
    </div>
  );
}

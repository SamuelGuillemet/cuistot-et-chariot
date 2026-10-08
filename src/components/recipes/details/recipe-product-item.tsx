import type { Doc } from '@api/dataModel';
import type { ProductUnit } from '@backend/types';
import { PackageIcon } from 'lucide-react';
import { getIconClass, ICON_FONT_MAP } from '@/components/food-icons/icon-food-font-config';
import { cn } from '@/lib/utils';
import { formatDecimal, formatScaledQuantity, formatUnit } from '@/utils/quantity';

interface RecipeProductItemProps {
  readonly recipeProduct: Doc<'recipeProducts'> & {
    readonly product: Doc<'products'> | null;
  };
  /** Quantity scaled to the chosen servings; omitted when showing the recipe as written. */
  readonly adjustedQuantity?: number;
  readonly showOriginal?: boolean;
}

function quantityText(value: number, unit: ProductUnit, scaled: boolean) {
  const text = scaled ? formatScaledQuantity(value, unit) : formatDecimal(value);
  return `${text} ${formatUnit(unit, value)}`;
}

export function RecipeProductItem({
  recipeProduct,
  adjustedQuantity,
  showOriginal = false,
}: RecipeProductItemProps) {
  const { product, quantity, unit } = recipeProduct;
  const hasAdjustment = adjustedQuantity !== undefined && adjustedQuantity !== quantity;
  const hasIcon = product !== null && product.icon in ICON_FONT_MAP;

  return (
    <div className="group relative flex items-center gap-3 hover:bg-accent/50 p-3 rounded-lg transition-colors">
      <div className="flex justify-center items-center w-8 text-3xl shrink-0">
        {hasIcon ? (
          <i className={getIconClass(product.icon)} aria-hidden="true" />
        ) : (
          <PackageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-primary text-base">
          {quantityText(hasAdjustment ? adjustedQuantity : quantity, unit, hasAdjustment)}
        </div>
        <p
          className={cn('font-medium text-sm truncate', !product && 'text-muted-foreground italic')}
        >
          {product ? product.name : 'Produit supprimé'}
        </p>
        {hasAdjustment && showOriginal && (
          <p className="text-muted-foreground text-xs italic">
            (recette : {quantityText(quantity, unit, false)})
          </p>
        )}
      </div>
    </div>
  );
}

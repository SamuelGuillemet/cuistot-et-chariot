import type { Doc } from 'convex/_generated/dataModel';
import { PRODUCT_UNITS } from 'convex/types';
import { Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getIconClass } from '../food-icons/icon-food-font-config';

interface RecipeProductItemProps {
  readonly recipeProduct: Doc<'recipeProducts'> & {
    readonly product: Doc<'products'> | null;
  };
  readonly canEdit: boolean;
  readonly onRemove?: (recipeProductId: Doc<'recipeProducts'>['_id']) => void;
  readonly adjustedQuantity?: number;
  readonly showOriginal?: boolean;
}

export function RecipeProductItem({
  recipeProduct,
  canEdit,
  onRemove,
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
      <div className="flex justify-center items-center bg-linear-to-br from-primary/20 to-primary/5 shadow-sm rounded-full w-12 h-12 shrink-0">
        <i
          className={cn(getIconClass(recipeProduct.product?.icon), 'text-3xl')}
        />
      </div>

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

      {canEdit && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(recipeProduct._id)}
          className="hover:bg-destructive/10 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity shrink-0"
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

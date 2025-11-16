import type { api } from '@api/api';
import type { FunctionReturnType } from 'convex/server';
import { CATEGORY_DISPLAY_NAMES } from 'convex/types';
import { ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getIconClass } from '../food-icons/icon-food-font-config';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type Product = FunctionReturnType<
  typeof api.products.queries.getProducts
>[number];

interface ProductSelectorProps {
  products: Product[];
  value?: string;
  onChange: (productId: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export function ProductSelector({
  products,
  value,
  onChange,
  onBlur,
  disabled = false,
  isInvalid = false,
}: Readonly<ProductSelectorProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedProduct = products.find((p) => p._id === value);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = searchText
        ? p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (p.description?.toLowerCase().includes(searchText.toLowerCase()) ??
            false)
        : true;
      const matchesCategory =
        categoryFilter === 'all' ? true : p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, categoryFilter]);

  const handleSelect = (product: Product) => {
    onChange(product._id);
    setIsOpen(false);
    setSearchText('');
    setCategoryFilter('all');
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        onBlur={onBlur}
        className={cn(
          'justify-start w-full font-normal text-left',
          !selectedProduct && 'text-muted-foreground',
          isInvalid && 'border-destructive',
        )}
      >
        {selectedProduct ? (
          <span className="flex items-center">
            <i className={cn(getIconClass(selectedProduct.icon), 'mr-2')} />
            {selectedProduct.name}
          </span>
        ) : (
          <span>Sélectionner un produit</span>
        )}
        <ChevronDownIcon className="opacity-50 ml-auto w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sélectionner un produit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Nom ou description..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {Object.entries(CATEGORY_DISPLAY_NAMES).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="border rounded-md h-[400px]">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-12 text-center">
                  <p className="font-medium text-muted-foreground">
                    Aucun produit trouvé
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Modifiez vos filtres pour voir plus de résultats
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className={cn(
                        'flex items-start gap-3 px-3 py-2.5 rounded-md w-full text-left transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        product._id === value && 'bg-accent',
                      )}
                    >
                      <i
                        className={cn(
                          getIconClass(product.icon),
                          'shrink-0 mt-0.5 text-xl',
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.description && (
                          <p className="text-muted-foreground text-xs truncate">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-1 text-muted-foreground text-xs">
                          {CATEGORY_DISPLAY_NAMES[product.category]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

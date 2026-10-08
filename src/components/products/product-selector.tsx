import { api } from '@api/api';
import { CATEGORY_DISPLAY_NAMES, type ProductUnit } from '@backend/types';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getIconClass } from '@/components/food-icons/icon-food-font-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/string-utils';
import { type Product as ProductFormValues, ProductForm } from './product-form';

type Product = FunctionReturnType<typeof api.products.queries.getProducts>[number];

interface ProductSelectorProps {
  products: Product[];
  value?: string;
  hint?: { name: string; unit: ProductUnit | null; productIds: readonly string[] };
  onChange: (productId: string, defaultUnit: ProductUnit) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export function ProductSelector({
  products,
  value,
  hint,
  onChange,
  onBlur,
  disabled = false,
  isInvalid = false,
}: Readonly<ProductSelectorProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsCreating(false);
      setSearchText('');
      setCategoryFilter('all');
    }
  };

  const handleSelect = (productId: string, defaultUnit: ProductUnit) => {
    onChange(productId, defaultUnit);
    handleOpenChange(false);
  };

  const createProduct = useMutation<
    FunctionReturnType<typeof api.products.mutations.createProduct>,
    Error,
    ProductFormValues
  >({
    mutationFn: useConvexMutation(api.products.mutations.createProduct),
    onSuccess: (productId, product) => {
      handleSelect(productId, product.defaultUnit);
      toast.success('Produit créé et sélectionné');
    },
  });

  const selectedProduct = products.find((p) => p._id === value);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = searchText
        ? p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (p.description?.toLowerCase().includes(searchText.toLowerCase()) ?? false)
        : true;
      const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, categoryFilter]);

  const suggestedIds = hint?.productIds ?? [];
  const suggestedProducts = suggestedIds.flatMap(
    (id) => filteredProducts.find((p) => p._id === id) ?? [],
  );
  const otherProducts = filteredProducts.filter((p) => !suggestedIds.includes(p._id));

  // Prefill from the best suggestion: a close product likely shares icon and category.
  const bestSuggestion = products.find((p) => p._id === suggestedIds[0]);
  const newProductName = searchText.trim() || hint?.name || '';

  const renderOption = (product: Product) => (
    <button
      key={product._id}
      type="button"
      onClick={() => handleSelect(product._id, product.defaultUnit)}
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-md w-full text-left transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        product._id === value && 'bg-accent',
      )}
    >
      <i className={cn(getIconClass(product.icon), 'shrink-0 mt-0.5 text-xl')} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{product.name}</p>
        {product.description && (
          <p className="text-muted-foreground text-xs truncate">{product.description}</p>
        )}
        <p className="mt-1 text-muted-foreground text-xs">
          {CATEGORY_DISPLAY_NAMES[product.category]}
        </p>
      </div>
    </button>
  );

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
          <span className="truncate">
            {hint ? 'Associer à un produit' : 'Sélectionner un produit'}
          </span>
        )}
        <ChevronDownIcon className="opacity-50 ml-auto w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className={cn('*:min-w-0', isCreating ? 'sm:max-w-4xl' : 'sm:max-w-2xl')}>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Nouveau produit' : 'Sélectionner un produit'}</DialogTitle>
          </DialogHeader>

          {isCreating ? (
            <div className="space-y-4">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Retour aux produits
              </Button>
              <ProductForm
                product={{
                  icon: bestSuggestion?.icon ?? '',
                  name: capitalize(newProductName),
                  description: '',
                  category: bestSuggestion?.category ?? 'other',
                  defaultUnit: hint?.unit ?? bestSuggestion?.defaultUnit ?? 'pieces',
                }}
                onSubmit={(product) => createProduct.mutate(product)}
                isLoading={createProduct.isPending}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsCreating(true)}
              >
                <PlusIcon />
                <span className="truncate">
                  {newProductName ? `Créer « ${newProductName} »` : 'Créer un nouveau produit'}
                </span>
              </Button>

              <div className="gap-4 grid sm:grid-cols-2">
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
                    items={[
                      { value: 'all', label: 'Toutes les catégories' },
                      ...Object.entries(CATEGORY_DISPLAY_NAMES).map(([value, label]) => ({
                        value,
                        label,
                      })),
                    ]}
                    value={categoryFilter}
                    onValueChange={(value) => {
                      if (value !== null) setCategoryFilter(value);
                    }}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {Object.entries(CATEGORY_DISPLAY_NAMES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="border rounded-md h-100">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-12 text-center">
                    <p className="font-medium text-muted-foreground">Aucun produit trouvé</p>
                    <p className="text-muted-foreground text-sm">
                      Modifiez vos filtres pour voir plus de résultats
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {suggestedProducts.length > 0 && (
                      <>
                        <p className="px-3 pt-2 pb-1 text-muted-foreground text-xs">Suggestions</p>
                        {suggestedProducts.map(renderOption)}
                        {otherProducts.length > 0 && (
                          <p className="px-3 pt-3 pb-1 text-muted-foreground text-xs">
                            Tous les produits
                          </p>
                        )}
                      </>
                    )}
                    {otherProducts.map(renderOption)}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

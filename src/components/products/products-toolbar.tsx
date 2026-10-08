import { api } from '@api/api';
import { CATEGORY_DISPLAY_NAMES } from '@backend/types';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FilterField, FiltersDrawer } from '@/components/layout/filters-drawer';
import { FooterItem } from '@/components/layout/footer';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Product, ProductForm } from './product-form';

export interface ProductFilters {
  search: string;
  category: string;
}

export interface ProductsToolbarProps {
  filters: ProductFilters;
  resultCount: number;
  onFilter: (filters: ProductFilters) => void;
}

export function ProductsToolbar({ filters, resultCount, onFilter }: ProductsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.products.mutations.createProduct),
    onSuccess: () => {
      toast.success('Produit créé avec succès');
      setIsOpen(false);
    },
  });

  const handleCreateProduct = (values: Product) => {
    mutate({
      ...values,
    });
  };

  const activeFilterCount = filters.category === 'all' ? 0 : 1;

  return (
    <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3 mb-4">
      <div className="flex flex-1 items-center gap-2">
        <SearchInput
          value={filters.search}
          onValueChange={(search) => onFilter({ ...filters, search })}
          placeholder="Rechercher…"
          label="Rechercher un produit"
          className="md:flex-none md:w-72"
        />
        <FiltersDrawer
          activeCount={activeFilterCount}
          resultCount={resultCount}
          onReset={() => onFilter({ ...filters, category: 'all' })}
        >
          <FilterField label="Catégorie" htmlFor="filter-category">
            <Select
              items={[
                ...Object.entries(CATEGORY_DISPLAY_NAMES).map(([value, label]) => ({
                  value,
                  label,
                })),
                { value: 'all', label: 'Toutes catégories' },
              ]}
              value={filters.category}
              onValueChange={(value) => {
                if (value !== null) onFilter({ ...filters, category: value });
              }}
            >
              <SelectTrigger id="filter-category" className="w-full">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_DISPLAY_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
                <SelectItem value="all">Toutes catégories</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        </FiltersDrawer>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <FooterItem id="products-new">
          <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
            <PlusIcon className="mr-2 w-4 h-4" /> Nouveau produit
          </DialogTrigger>
        </FooterItem>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nouveau produit</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleCreateProduct} isLoading={isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

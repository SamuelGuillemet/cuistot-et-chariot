import { api } from '@api/api';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { CATEGORY_DISPLAY_NAMES } from 'convex/types';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Product, ProductForm } from './product-form';

export interface ProductsToolbarProps {
  householdId: string;
  onFilter: (data: { search: string; category: string }) => void;
}

export function ProductsToolbar({
  onFilter,
  householdId,
}: ProductsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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
      publicId: householdId,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilter({ search: value, category });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilter({ search, category: value });
  };

  const hasFilters = useMemo(
    () => search.trim().length > 0 || category !== 'all',
    [search, category],
  );

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    onFilter({ search: '', category: 'all' });
  };

  return (
    <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3 mb-4">
      <div className="flex md:flex-row flex-col flex-1 md:items-center gap-3">
        <div className="relative md:w-72">
          <SearchIcon className="top-1/2 left-2 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-8"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-56">
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
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1"
            >
              <XIcon className="w-3.5 h-3.5" /> Réinitialiser
            </Button>
          )}
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="self-start md:self-auto">
            <PlusIcon className="mr-2 w-4 h-4" /> Nouveau produit
          </Button>
        </DialogTrigger>
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

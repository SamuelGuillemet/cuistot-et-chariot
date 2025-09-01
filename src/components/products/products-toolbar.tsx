import type { Doc } from 'convex/_generated/dataModel';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { ProductForm, type ProductFormValues } from './product-form';

const categoryOptions = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'dairy', label: 'Produits laitiers' },
  { value: 'meat', label: 'Viande' },
  { value: 'vegetables', label: 'Légumes' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Céréales' },
  { value: 'bakery', label: 'Boulangerie' },
  { value: 'frozen', label: 'Surgelés' },
  { value: 'beverages', label: 'Boissons' },
  { value: 'snacks', label: 'Collations' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'cleaning', label: 'Nettoyage' },
  { value: 'personal-care', label: 'Hygiène' },
  { value: 'other', label: 'Autres' },
];

export interface ProductsToolbarProps {
  products: Doc<'products'>[];
  onCreate: (values: ProductFormValues) => void;
  isCreating: boolean;
  onFilter: (data: { search: string; category: string }) => void;
}

export function ProductsToolbar({
  onCreate,
  isCreating,
  onFilter,
}: ProductsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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
              {categoryOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
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
          <ProductForm onSubmit={onCreate} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

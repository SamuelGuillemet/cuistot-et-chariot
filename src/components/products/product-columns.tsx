import type { ColumnDef } from '@tanstack/react-table';
import type { Doc } from 'convex/_generated/dataModel';
import type { ProductCategory, ProductUnit } from 'convex/types';
import {
  type FoodIcons,
  getIconClass,
} from '@/components/food-icons/icon-food-font-config';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ProductActions } from './product-actions';

// Product type with id for table
export type ProductWithId = Doc<'products'> & { id: string };

// Category display names in French
const categoryDisplayNames: Record<string, string> = {
  dairy: 'Produits laitiers',
  meat: 'Viande',
  vegetables: 'Légumes',
  fruits: 'Fruits',
  grains: 'Céréales',
  bakery: 'Boulangerie',
  frozen: 'Surgelés',
  beverages: 'Boissons',
  snacks: 'Collations',
  condiments: 'Condiments',
  cleaning: 'Nettoyage',
  'personal-care': 'Hygiène',
  other: 'Autres',
};

// Unit display names in French
const unitDisplayNames: Record<string, string> = {
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pieces: 'pièces',
  pack: 'paquet',
  bottle: 'bouteille',
  can: 'boîte',
  box: 'boîte',
  bag: 'sac',
  cup: 'tasse',
  tablespoon: 'cuillère à soupe',
  teaspoon: 'cuillère à café',
};

// Component to create columns with householdId
export function createProductColumns(
  householdId: string,
): ColumnDef<ProductWithId>[] {
  return [
    {
      accessorKey: 'icon',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Icône" />
      ),
      cell: ({ row }) => {
        const icon = row.getValue<FoodIcons>('icon');
        return (
          <div className="flex justify-center">
            <span className={`${getIconClass(icon)} text-2xl`} />
          </div>
        );
      },
      enableSorting: false,
      size: 80,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => {
        const name = row.getValue<string>('name');
        return <div className="font-medium">{name}</div>;
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description = row.getValue<string | undefined>('description');
        return (
          <div className="text-muted-foreground">{description || '-'}</div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Catégorie" />
      ),
      cell: ({ row }) => {
        const category = row.getValue<ProductCategory>('category');
        return (
          <Badge variant="secondary">
            {categoryDisplayNames[category] || category}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'defaultUnit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unité par défaut" />
      ),
      cell: ({ row }) => {
        const unit = row.getValue<ProductUnit>('defaultUnit');
        return (
          <span className="text-muted-foreground">
            {unitDisplayNames[unit] || unit}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;

        return <ProductActions product={product} householdId={householdId} />;
      },
      enableSorting: false,
      size: 120,
    },
  ];
}

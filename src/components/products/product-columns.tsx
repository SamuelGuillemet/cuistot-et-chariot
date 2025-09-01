import type { ColumnDef } from '@tanstack/react-table';
import type { Doc } from 'convex/_generated/dataModel';
import {
  CATEGORY_DISPLAY_NAMES,
  PRODUCT_UNITS,
  type ProductCategory,
  type ProductUnit,
} from 'convex/types';
import {
  type FoodIcons,
  getIconClass,
} from '@/components/food-icons/icon-food-font-config';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { ProductActions } from './product-actions';

export function createProductColumns(
  householdId: string,
): ColumnDef<Doc<'products'>>[] {
  return [
    {
      id: 'id',
      accessorKey: '_id',
    },
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
            {CATEGORY_DISPLAY_NAMES[category] || category}
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
        return <Badge variant="outline">{PRODUCT_UNITS[unit] || unit}</Badge>;
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

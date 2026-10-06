import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { createProductColumns } from '@/components/products/product-columns';
import { ProductsToolbar } from '@/components/products/products-toolbar';
import { DataTable } from '@/components/table/data-table';

export const Route = createFileRoute('/_authed/products')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.convexQueryClient.queryClient.query({
      ...convexQuery(api.products.queries.getProducts, {}),
      staleTime: 'static',
    });
  },
});

function RouteComponent() {
  const [filters, setFilters] = useState<{ search: string; category: string }>({
    search: '',
    category: 'all',
  });

  const { data: products } = useSuspenseQuery(convexQuery(api.products.queries.getProducts, {}));

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = filters.search
        ? p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(filters.search.toLowerCase()) ?? false)
        : true;
      const matchesCategory = filters.category === 'all' ? true : p.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [products, filters]);

  const columns = useMemo(() => createProductColumns(), []);

  return (
    <div className="space-y-4 mt-5">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Produits</h1>
        <p className="text-muted-foreground">
          Gérez vos produits ({filtered.length}
          {filtered.length > 1 ? ' éléments' : ' élément'})
        </p>
      </div>

      <ProductsToolbar onFilter={setFilters} />

      {filtered.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <div className="space-y-1">
            <p className="font-medium text-lg">Aucun produit trouvé</p>
            <p className="max-w-md text-muted-foreground text-sm">
              {products.length === 0
                ? 'Commencez en ajoutant votre premier produit.'
                : 'Aucun produit ne correspond à vos filtres. Modifiez la recherche ou la catégorie.'}
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      )}
    </div>
  );
}

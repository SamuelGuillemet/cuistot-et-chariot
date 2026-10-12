import { api } from '@api/api';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { createProductColumns } from '@/components/products/product-columns';
import { type ProductFilters, ProductsToolbar } from '@/components/products/products-toolbar';
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

const NO_FILTERS: ProductFilters = { search: '', category: 'all' };

function RouteComponent() {
  const [filters, setFilters] = useState<ProductFilters>(NO_FILTERS);

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
    <div className="space-y-4 my-5">
      <h1 className="font-bold text-2xl tracking-tight">Produits</h1>
      <ProductsToolbar filters={filters} onFilter={setFilters} resultCount={filtered.length} />

      <DataTable
        columns={columns}
        data={filtered}
        defaultSorting={[{ id: 'name', desc: false }]}
        hideOnMobile={['description', 'category', 'defaultUnit']}
      />
    </div>
  );
}

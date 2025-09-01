import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createProductColumns } from '@/components/products/product-columns';
import type { ProductFormValues } from '@/components/products/product-form';
import { ProductsToolbar } from '@/components/products/products-toolbar';
import { DataTable } from '@/components/table/data-table';

// Remove temporary placeholder types

export const Route = createFileRoute('/_authed/products')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const householdId = context.householdId;
    if (!householdId) {
      throw redirect({ to: '/dashboard' });
    }

    return { householdId };
  },
  loader: async ({ context }) => {
    const householdId = context.householdId;
    if (householdId) {
      await context.convexQueryClient.queryClient.ensureQueryData(
        convexQuery(api.products.queries.getProducts, {
          publicId: householdId,
        }),
      );
    }

    return {
      breadcrumbs: 'Produits',
      householdId: householdId as string,
    };
  },
});

function RouteComponent() {
  const { householdId } = Route.useLoaderData();
  const [filters, setFilters] = useState<{ search: string; category: string }>({
    search: '',
    category: 'all',
  });

  const { data: products = [] } = useSuspenseQuery(
    convexQuery(api.products.queries.getProducts, { publicId: householdId }),
  );

  const createProductMutation = useMutation({
    mutationFn: useConvexMutation(api.products.mutations.createProduct),
    onSuccess: () => {
      toast.success('Produit créé avec succès');
    },
  });

  const handleCreateProduct = (values: ProductFormValues) => {
    createProductMutation.mutate({
      publicId: householdId,
      icon: values.icon,
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      defaultUnit: values.defaultUnit,
    });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = filters.search
        ? p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (p.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ??
            false)
        : true;
      const matchesCategory =
        filters.category === 'all' ? true : p.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [products, filters]);

  const columns = useMemo(
    () => createProductColumns(householdId),
    [householdId],
  );

  return (
    <div className="space-y-4 mx-auto py-6 container">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Produits</h1>
        <p className="text-muted-foreground">
          Gérez les produits de votre foyer ({filtered.length}
          {filtered.length > 1 ? ' éléments' : ' élément'})
        </p>
      </div>

      <ProductsToolbar
        products={products}
        onCreate={handleCreateProduct}
        isCreating={createProductMutation.isPending}
        onFilter={setFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 bg-muted/30 py-16 border rounded-md text-center">
          <div className="space-y-1">
            <p className="font-medium text-lg">Aucun produit trouvé</p>
            <p className="max-w-md text-muted-foreground text-sm">
              {products.length === 0
                ? 'Commencez en ajoutant votre premier produit à votre foyer.'
                : 'Aucun produit ne correspond à vos filtres. Modifiez la recherche ou la catégorie.'}
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered.map((p) => ({ ...p, id: p._id }))}
        />
      )}
    </div>
  );
}

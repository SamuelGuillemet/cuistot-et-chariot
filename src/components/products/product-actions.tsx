import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { PenIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ProductForm, type ProductFormValues } from './product-form';

interface ProductActionsProps {
  product: Doc<'products'>;
  householdId: string;
}

export function ProductActions({ product, householdId }: ProductActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateProductMutation = useMutation({
    mutationFn: useConvexMutation(api.products.mutations.updateProduct),
    onSuccess: () => {
      toast.success('Produit modifié avec succès');
      setIsEditDialogOpen(false);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: useConvexMutation(api.products.mutations.deleteProduct),
    onSuccess: () => {
      toast.success('Produit supprimé avec succès');
      setIsDeleteDialogOpen(false);
    },
  });

  const handleEditProduct = (values: ProductFormValues) => {
    updateProductMutation.mutate({
      ...values,
      publicId: householdId,
      productId: product._id,
    });
  };

  const handleDeleteProduct = () => {
    deleteProductMutation.mutate({
      publicId: householdId,
      productId: product._id,
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <PenIcon className="w-4 h-4" />
              <span className="sr-only">Modifier</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Modifier</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Supprimer</TooltipContent>
        </Tooltip>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleEditProduct}
            isLoading={updateProductMutation.isPending}
            defaultValues={{
              ...product,
            }}
            submitText="Modifier le produit"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera
              définitivement le produit "{product.name}" de votre foyer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteProductMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

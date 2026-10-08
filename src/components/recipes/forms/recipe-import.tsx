import { api } from '@api/api';
import { useConvexAction } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import type { FunctionReturnType } from 'convex/server';
import { SearchIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ImportedRecipe = NonNullable<
  FunctionReturnType<typeof api.recipes.actions.searchMarmiton>
>;

export function RecipeImport({
  disabled,
  confirmOverwrite,
  onImport,
}: {
  readonly disabled?: boolean;
  readonly confirmOverwrite: boolean;
  readonly onImport: (recipe: ImportedRecipe) => void;
}) {
  const [query, setQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate: search, isPending } = useMutation<
    ImportedRecipe | null,
    Error,
    { query: string }
  >({
    mutationFn: useConvexAction(api.recipes.actions.searchMarmiton),
    onSuccess: (recipe) => {
      if (!recipe) {
        toast.error('Aucune recette Marmiton trouvée pour cette recherche.');
        return;
      }
      onImport(recipe);
      setQuery('');
      toast.success('Recette importée. Vérifiez les ingrédients suggérés.');
    },
  });

  const canSearch = !disabled && !isPending && query.trim() !== '';
  const handleSearch = () => {
    if (!canSearch) return;
    if (confirmOverwrite) {
      setIsConfirmOpen(true);
      return;
    }
    search({ query });
  };

  return (
    <div className="flex items-end gap-2 px-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor="marmiton-query">Importer depuis Marmiton</Label>
        <Input
          id="marmiton-query"
          placeholder="Ex: lasagnes"
          value={query}
          disabled={disabled || isPending}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Enter would otherwise submit the surrounding recipe form.
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSearch();
            }
          }}
        />
      </div>
      <Button type="button" variant="outline" disabled={!canSearch} onClick={handleSearch}>
        <SearchIcon /> {isPending ? 'Recherche…' : 'Rechercher'}
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer le formulaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Importer cette recette remplacera les modifications en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsConfirmOpen(false);
                search({ query });
              }}
            >
              Importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

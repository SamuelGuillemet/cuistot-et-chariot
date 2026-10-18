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
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';

export type ImportedRecipe = NonNullable<
  FunctionReturnType<typeof api.recipes.actions.importMarmiton>
>;
type MarmitonSearchResult = FunctionReturnType<typeof api.recipes.actions.searchMarmiton>[number];

interface RecipeImportProps {
  readonly disabled?: boolean;
  readonly confirmOverwrite: boolean;
  readonly onImport: (recipe: ImportedRecipe) => void;
}

export function RecipeImport({ disabled, confirmOverwrite, onImport }: RecipeImportProps) {
  const [query, setQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    mutate: search,
    data: searchResults,
    isPending: isSearching,
    reset: resetSearch,
  } = useMutation({
    mutationFn: useConvexAction(api.recipes.actions.searchMarmiton),
    onSuccess: (recipes: MarmitonSearchResult[]) => {
      setSelectedUrl(recipes[0]?.url ?? '');

      if (recipes.length === 0) {
        toast.error('Aucune recette Marmiton trouvée pour cette recherche.');
      } else {
        setIsResultsOpen(true);
      }
    },
  });

  const { mutate: importRecipe, isPending: isImporting } = useMutation({
    mutationFn: useConvexAction(api.recipes.actions.importMarmiton),
    onSuccess: (recipe: ImportedRecipe) => {
      onImport(recipe);

      setQuery('');
      setSelectedUrl('');
      setIsResultsOpen(false);

      resetSearch();
      toast.success('Recette importée. Vérifiez les ingrédients suggérés.');
    },
  });

  const results = searchResults ?? [];

  const canSearch = !disabled && !isSearching && !isImporting && query.trim() !== '';
  const handleSearch = () => {
    if (!canSearch) return;
    setSelectedUrl('');
    setIsResultsOpen(false);
    search({ query });
  };

  const handleImport = () => {
    if (disabled || isImporting || !selectedUrl) return;
    if (confirmOverwrite) {
      setIsConfirmOpen(true);
      return;
    }
    importRecipe({ url: selectedUrl });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="marmiton-query">Importer depuis Marmiton</Label>
          <Input
            id="marmiton-query"
            placeholder="Ex: lasagnes"
            value={query}
            disabled={disabled || isSearching || isImporting}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>
        <Button type="button" variant="outline" disabled={!canSearch} onClick={handleSearch}>
          <SearchIcon /> {isSearching ? 'Recherche…' : 'Rechercher'}
        </Button>
      </div>

      {results.length > 0 && (
        <ResponsiveDialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
          <ResponsiveDialogContent className="sm:max-w-xl overflow-hidden">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Choisissez une recette</ResponsiveDialogTitle>
            </ResponsiveDialogHeader>
            <div
              role="group"
              aria-label="Résultats Marmiton"
              className="grid max-h-mid-screen gap-2 overflow-y-auto"
            >
              {results.map((result) => (
                <button
                  key={result.url}
                  type="button"
                  aria-pressed={selectedUrl === result.url}
                  disabled={disabled || isImporting}
                  onClick={() => setSelectedUrl(result.url)}
                  className="w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {result.name}
                </button>
              ))}
            </div>
            <ResponsiveDialogFooter>
              <Button
                type="button"
                disabled={disabled || isImporting || !selectedUrl}
                onClick={handleImport}
              >
                {isImporting ? 'Import en cours...' : 'Importer la recette sélectionnée'}
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      )}

      {results.length > 0 && !isResultsOpen && (
        <Button type="button" variant="outline" onClick={() => setIsResultsOpen(true)}>
          Voir les résultats ({results.length})
        </Button>
      )}

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
                importRecipe({ url: selectedUrl });
              }}
            >
              Remplacer et importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

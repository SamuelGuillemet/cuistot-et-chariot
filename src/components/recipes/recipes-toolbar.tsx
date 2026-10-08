import { RECIPE_DIFFICULTY_DISPLAY_NAMES } from '@backend/types';
import { Link } from '@tanstack/react-router';
import { HeartIcon, PlusIcon } from 'lucide-react';
import { FilterField, FiltersDrawer } from '@/components/layout/filters-drawer';
import { FooterItem } from '@/components/layout/footer';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface RecipesToolbarProps {
  readonly onFilter: (filters: {
    search: string;
    difficulty: string;
    showFavoritesOnly: boolean;
  }) => void;
  readonly canCreate: boolean;
  readonly resultCount: number;
  readonly filters: {
    search: string;
    difficulty: string;
    showFavoritesOnly: boolean;
  };
}

export function RecipesToolbar({ onFilter, canCreate, resultCount, filters }: RecipesToolbarProps) {
  const activeFilterCount =
    (filters.difficulty !== 'all' ? 1 : 0) + (filters.showFavoritesOnly ? 1 : 0);

  return (
    <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
      <div className="flex flex-1 items-center gap-2">
        <SearchInput
          value={filters.search}
          onValueChange={(search) => onFilter({ ...filters, search })}
          placeholder="Rechercher…"
          label="Rechercher une recette"
          className="max-w-sm"
        />

        <FiltersDrawer
          activeCount={activeFilterCount}
          resultCount={resultCount}
          onReset={() => onFilter({ ...filters, difficulty: 'all', showFavoritesOnly: false })}
        >
          <FilterField label="Difficulté" htmlFor="filter-difficulty">
            <Select
              items={[
                { value: 'all', label: 'Toutes les difficultés' },
                ...Object.entries(RECIPE_DIFFICULTY_DISPLAY_NAMES).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              value={filters.difficulty}
              onValueChange={(value) => {
                if (value !== null) onFilter({ ...filters, difficulty: value });
              }}
            >
              <SelectTrigger id="filter-difficulty" className="w-full">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les difficultés</SelectItem>
                {Object.entries(RECIPE_DIFFICULTY_DISPLAY_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <div className="flex justify-between items-center gap-3 min-h-11">
            <Label htmlFor="filter-favorites" className="gap-2">
              <HeartIcon className="w-4 h-4" /> Favoris uniquement
            </Label>
            <Switch
              id="filter-favorites"
              checked={filters.showFavoritesOnly}
              onCheckedChange={(showFavoritesOnly) => onFilter({ ...filters, showFavoritesOnly })}
            />
          </div>
        </FiltersDrawer>
      </div>

      {canCreate && (
        <FooterItem id="recipes-new">
          <Button
            nativeButton={false}
            render={<Link to="/recipes/new" />}
            className="w-full sm:w-auto"
          >
            <PlusIcon className="mr-2 w-4 h-4" />
            Nouvelle recette
          </Button>
        </FooterItem>
      )}
    </div>
  );
}

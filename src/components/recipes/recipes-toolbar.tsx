import { Link } from '@tanstack/react-router';
import { RECIPE_DIFFICULTY_DISPLAY_NAMES } from 'convex/types';
import { HeartIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RecipesToolbarProps {
  readonly onFilter: (filters: {
    search: string;
    difficulty: string;
    showFavoritesOnly: boolean;
  }) => void;
  readonly canCreate: boolean;
  readonly filters: {
    search: string;
    difficulty: string;
    showFavoritesOnly: boolean;
  };
}

export function RecipesToolbar({
  onFilter,
  canCreate,
  filters,
}: RecipesToolbarProps) {
  return (
    <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
      <div className="flex sm:flex-row flex-col flex-1 sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une recette..."
            value={filters.search}
            onChange={(e) => onFilter({ ...filters, search: e.target.value })}
            className="pl-8"
          />
        </div>

        <Select
          value={filters.difficulty}
          onValueChange={(value) => onFilter({ ...filters, difficulty: value })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les difficultés</SelectItem>
            {Object.entries(RECIPE_DIFFICULTY_DISPLAY_NAMES).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Button
          variant={filters.showFavoritesOnly ? 'default' : 'outline'}
          onClick={() =>
            onFilter({
              ...filters,
              showFavoritesOnly: !filters.showFavoritesOnly,
            })
          }
          className="w-full sm:w-auto"
        >
          <HeartIcon
            className={`mr-2 h-4 w-4 ${filters.showFavoritesOnly ? 'fill-current' : ''}`}
          />
          Favoris
        </Button>
      </div>

      {canCreate && (
        <Button asChild>
          <Link to="/recipes/new">
            <PlusIcon className="mr-2 w-4 h-4" />
            Nouvelle recette
          </Link>
        </Button>
      )}
    </div>
  );
}

import { SearchIcon, XIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CATEGORY_TRANSLATIONS,
  type FoodIconData,
  type FoodIcons,
  getIconClass,
  ICON_DATA,
} from './icon-food-font-config';
import { useIconSearch } from './useIconSearch';

interface IconItemProps {
  icon: FoodIconData;
  isSelected: boolean;
  onClick: (icon: FoodIconData) => void;
}

const IconItem: React.FC<IconItemProps> = ({ icon, isSelected, onClick }) => {
  const iconName = icon.name;
  const iconClass = getIconClass(icon.id);

  return (
    <button
      className={cn(
        'flex flex-col justify-start items-center gap-1 p-3 border-2 rounded-lg text-center transition-all duration-200 cursor-pointer',
        'bg-background hover:bg-accent hover:text-accent-foreground group',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary bg-primary/5 text-primary shadow-md'
          : 'border-transparent hover:border-primary/20',
      )}
      onClick={() => onClick(icon)}
      type="button"
      title={iconName}
    >
      <div
        className={cn(
          'flex justify-center items-center rounded-lg w-12 h-12',
          'bg-muted border border-accent-foreground/50',
          isSelected ? 'bg-primary/10 border-primary/20' : '',
        )}
      >
        <i className={cn(iconClass, 'text-2xl')} aria-hidden="true" />
      </div>
      <span
        className={cn(
          'font-medium text-xs leading-tight',
          isSelected ? 'text-primary font-semibold' : 'text-foreground',
        )}
      >
        {iconName}
      </span>
      <span className="grow"></span>
    </button>
  );
};

interface IconSelectorProps {
  onIconSelect: (icon: FoodIcons | undefined) => void;
  selectedIcon?: FoodIcons;
  showCategories?: boolean;
  className?: string;
}

export const FoodIconSelector: React.FC<IconSelectorProps> = ({
  onIconSelect,
  selectedIcon,
  showCategories = true,
  className = '',
}) => {
  const {
    filters,
    filteredIcons,
    categories,
    updateSearch,
    updateCategory,
    clearFilters,
    totalResults,
  } = useIconSearch(ICON_DATA);

  // Sort icons to show selected icon first, then limit results for performance
  const displayedIcons = useMemo(() => {
    const icons = [...filteredIcons];

    if (selectedIcon) {
      const selectedIconData = icons.find((icon) => icon.id === selectedIcon);
      // Remove selected icon from current position
      const filteredWithoutSelected = icons.filter(
        (icon) => icon.id !== selectedIcon,
      );

      if (selectedIconData) {
        // Add selected icon at the beginning if it matches filters
        return [selectedIconData, ...filteredWithoutSelected];
      }
    }

    return icons;
  }, [filteredIcons, selectedIcon]);

  const handleIconClick = useCallback(
    (icon: FoodIconData) => {
      if (icon.id === selectedIcon) {
        onIconSelect(undefined);
      } else {
        onIconSelect(icon.id);
      }
    },
    [onIconSelect, selectedIcon],
  );

  const formatResultsText = (count: number): string => {
    const template = 'Affichage de {count} icône{s}';
    const s = count === 1 ? '' : 's';
    return template.replace('{count}', count.toString()).replace('{s}', s);
  };

  return (
    <Card
      className={cn(
        'bg-background py-0 md:py-6 rounded-xl max-w-full overflow-hidden',
        className,
      )}
    >
      <CardHeader className="p-0 md:p-4">
        {/* Search Bar */}
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Rechercher des icônes..."
              value={filters.searchTerm}
              onChange={(e) => updateSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter */}
            {showCategories && (
              <Select value={filters.category} onValueChange={updateCategory}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all'
                        ? 'Toutes les catégories'
                        : CATEGORY_TRANSLATIONS[
                            category as keyof typeof CATEGORY_TRANSLATIONS
                          ] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Filters */}
            {(filters.searchTerm || filters.category !== 'all') && (
              <Button variant="destructive" size="sm" onClick={clearFilters}>
                <XIcon className="mr-2 w-4 h-4" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-muted-foreground text-sm">
          {totalResults > 0 ? (
            <span>{formatResultsText(totalResults)}</span>
          ) : (
            <span>Aucun résultat trouvé</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 md:px-2 pt-0">
        {/* Icons Grid */}
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 p-0 md:p-4 scrollbar-thumb-border max-h-60 md:max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-muted">
          {displayedIcons.map((icon) => (
            <IconItem
              key={icon.id}
              icon={icon}
              isSelected={icon.id === selectedIcon}
              onClick={handleIconClick}
            />
          ))}
        </div>

        {/* No Results */}
        {displayedIcons.length === 0 && filters.searchTerm && (
          <div className="flex flex-col justify-center items-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">Aucun résultat trouvé</p>
            <Button variant="outline" onClick={clearFilters}>
              <XIcon className="mr-2 w-4 h-4" />
              Effacer les filtres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

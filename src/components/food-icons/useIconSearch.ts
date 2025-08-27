import { useMemo, useState } from 'react';
import type { FoodIconData } from './icon-food-font-config';

interface IconSearchFilters {
  searchTerm: string;
  category: string;
  categories: string[];
}

export const useIconSearch = (icons: FoodIconData[]) => {
  const [filters, setFilters] = useState<IconSearchFilters>({
    searchTerm: '',
    category: 'all',
    categories: [],
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(icons.map((icon) => icon.category))];
    return cats;
  }, [icons]);

  // Filter icons based on search criteria
  const filteredIcons = useMemo(() => {
    return icons.filter((icon) => {
      // Category filter
      if (filters.category !== 'all' && icon.category !== filters.category) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return [icon.name, icon.category, icon.id].some((tag) =>
          tag.toLowerCase().includes(searchLower),
        );
      }

      return true;
    });
  }, [icons, filters]);

  const updateSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const updateCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      categories: [],
    });
  };

  return {
    filters,
    filteredIcons,
    categories,
    updateSearch,
    updateCategory,
    clearFilters,
    totalResults: filteredIcons.length,
  };
};

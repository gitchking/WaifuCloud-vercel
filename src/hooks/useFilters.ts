import { useState, useCallback, useEffect } from 'react';
import { FilterOptions } from '@/components/FilterSection';

export const useFilters = (initialFilters?: Partial<FilterOptions>) => {
  // Load saved filters from localStorage
  const loadSavedFilters = (): FilterOptions => {
    try {
      const saved = localStorage.getItem('wallpaper-filters');
      if (saved) {
        const parsedFilters = JSON.parse(saved);
        return {
          view: parsedFilters.view || 'list',
          device: parsedFilters.device || 'phone',
          sort: parsedFilters.sort || 'latest',
          ...initialFilters
        };
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    
    return {
      view: 'list',
      device: 'phone',
      sort: 'latest',
      ...initialFilters
    };
  };

  const [filters, setFilters] = useState<FilterOptions>(loadSavedFilters);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('wallpaper-filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      view: 'list' as const,
      device: 'phone' as const,
      sort: 'latest' as const
    };
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters
  };
};
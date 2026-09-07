'use client';

/**
 * useSearch hook
 * Debounced search with autocomplete, trending terms, and history management.
 * Works with static mock data when backend is unavailable.
 */

import * as React from 'react';
import { products } from '@/lib/data';

interface SearchSuggestion {
  type: 'product' | 'brand' | 'category' | 'query';
  text: string;
  slug?: string;
  image?: string;
}

interface UseSearchOptions {
  debounceMs?: number;
  maxSuggestions?: number;
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: SearchSuggestion[];
  isSuggestingOpen: boolean;
  closeSuggestions: () => void;
  results: typeof products;
  isLoading: boolean;
  search: (q: string) => void;
  clearQuery: () => void;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

const RECENT_SEARCHES_KEY = 'vyzo_recent_searches';
const MAX_RECENT = 5;

function getStoredSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useSearch({
  debounceMs = 300,
  maxSuggestions = 8,
}: UseSearchOptions = {}): UseSearchReturn {
  const [query, setQueryState] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [isSuggestingOpen, setIsSuggestingOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  // Debounce query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const setQuery = React.useCallback((q: string) => {
    setQueryState(q);
    setIsSuggestingOpen(q.length > 0);
  }, []);

  const clearQuery = React.useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setIsSuggestingOpen(false);
  }, []);

  const closeSuggestions = React.useCallback(() => {
    setIsSuggestingOpen(false);
  }, []);

  // Generate suggestions from static data (replace with API call when backend ready)
  const suggestions = React.useMemo<SearchSuggestion[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];

    const q = debouncedQuery.toLowerCase();
    const productSuggestions: SearchSuggestion[] = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, maxSuggestions)
      .map((p) => ({
        type: 'product',
        text: p.name,
        slug: p.slug,
        image: p.image,
      }));

    return productSuggestions;
  }, [debouncedQuery, maxSuggestions]);

  // Filter products for search results
  const results = React.useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const search = React.useCallback(
    (q: string) => {
      setQueryState(q);
      setDebouncedQuery(q);
      setIsSuggestingOpen(false);
      addRecentSearch(q);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addRecentSearch = React.useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const updated = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT);
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = React.useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isSuggestingOpen,
    closeSuggestions,
    results,
    isLoading,
    search,
    clearQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

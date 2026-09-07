/**
 * Search API
 * Full-text search, autocomplete, trending searches
 */

import { api } from './client';
import type { ApiProduct } from './products';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchFilters {
  q: string;
  category?: string;
  brand?: string | string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  in_stock?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'trending';
  page?: number;
  per_page?: number;
}

export interface SearchResults {
  items: ApiProduct[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  query: string;
  filters_applied: Partial<SearchFilters>;
  search_time_ms: number;
}

export interface AutocompleteResult {
  type: 'product' | 'brand' | 'category' | 'query';
  text: string;
  slug?: string;
  image?: string;
  price?: number;
}

export interface TrendingSearchResult {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Full search with filters */
export async function searchProducts(
  filters: SearchFilters
): Promise<SearchResults> {
  const { brand, ...rest } = filters;
  const params: Record<string, string | number | boolean | undefined> = { ...rest };
  if (brand) {
    if (Array.isArray(brand)) {
      params.brand = brand.join(',');
    } else {
      params.brand = brand;
    }
  }
  return api.get<SearchResults>('/search', params);
}

/** Instant autocomplete suggestions (debounce on the client) */
export async function getAutocomplete(
  query: string,
  limit = 8
): Promise<AutocompleteResult[]> {
  if (query.length < 2) return [];
  return api.get<AutocompleteResult[]>('/search/autocomplete', { q: query, limit });
}

/** Trending searches */
export async function getTrendingSearches(
  limit = 10
): Promise<TrendingSearchResult[]> {
  return api.get<TrendingSearchResult[]>('/search/trending', { limit });
}

/** Personalized search suggestions for logged-in users */
export async function getSearchSuggestions(
  limit = 6
): Promise<string[]> {
  return api.get<string[]>('/search/suggestions', { limit });
}

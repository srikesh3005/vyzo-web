/**
 * Products API
 * All product-related API calls with proper TypeScript typing.
 * Falls back gracefully when backend is unavailable.
 */

import { api } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductSpec {
  key: string;
  value: string;
  group_name?: string;
}

export interface AISummary {
  summary: string;
  pros: string[];
  cons: string[];
  best_for: string[];
  who_should_avoid: string[];
  buying_guide?: string;
  faqs: { question: string; answer: string }[];
  recommendation_score: number; // 0-10
  model_version: string;
  generated_at: string;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brand_slug: string;
  category: string;
  category_slug: string;
  price: number;
  mrp: number;
  currency: string;
  rating: number;
  review_count: number;
  image: string;
  images: ProductImage[];
  in_stock: boolean;
  is_trending: boolean;
  is_featured: boolean;
  is_editors_pick: boolean;
  is_best_seller: boolean;
  ai_summary?: AISummary;
  specs: Record<string, string>;
  description: string;
  affiliate_url?: string;
  amazon_asin?: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  in_stock?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'trending';
  page?: number;
  per_page?: number;
}

export interface ComparisonMatrix {
  products: ApiProduct[];
  common_specs: string[];
  differences: Record<string, Record<string, string>>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get paginated product list with filters */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ApiProduct>> {
  return api.get<PaginatedResponse<ApiProduct>>('/products', {
    ...filters,
    in_stock: filters.in_stock as unknown as string,
  } as Record<string, string | number | boolean | undefined>);
}

/** Get single product by slug with full data */
export async function getProduct(slug: string): Promise<ApiProduct> {
  return api.get<ApiProduct>(`/products/${slug}`);
}

/** Get trending products */
export async function getTrendingProducts(
  limit = 8
): Promise<ApiProduct[]> {
  return api.get<ApiProduct[]>('/products/trending', { limit });
}

/** Get featured products */
export async function getFeaturedProducts(
  limit = 8
): Promise<ApiProduct[]> {
  return api.get<ApiProduct[]>('/products/featured', { limit });
}

/** Get alternative products for a given product */
export async function getAlternatives(
  slug: string,
  limit = 4
): Promise<ApiProduct[]> {
  return api.get<ApiProduct[]>(`/products/${slug}/alternatives`, { limit });
}

/** Get related products for a given product */
export async function getRelated(
  slug: string,
  limit = 4
): Promise<ApiProduct[]> {
  return api.get<ApiProduct[]>(`/products/${slug}/related`, { limit });
}

/** Get comparison matrix for multiple products */
export async function compareProducts(
  ids: string[]
): Promise<ComparisonMatrix> {
  return api.post<ComparisonMatrix>('/products/compare', { product_ids: ids });
}

/** Record a product view (fire-and-forget) */
export async function recordProductView(productId: string): Promise<void> {
  try {
    await api.post(`/products/${productId}/view`);
  } catch {
    // Non-critical — silently fail
  }
}

/** Record affiliate click (fire-and-forget) */
export async function recordAffiliateClick(productId: string): Promise<void> {
  try {
    await api.post(`/products/${productId}/click`);
  } catch {
    // Non-critical — silently fail
  }
}

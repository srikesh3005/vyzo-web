/**
 * Vyzo — Product Data Provider Types
 * Abstraction layer so AmazonProductProvider, FlipkartProductProvider, etc.
 * all conform to the same interface. Routes never contain merchant-specific logic.
 */

export interface ProviderProductImage {
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProviderProductSpec {
  group_name?: string;
  name: string;
  value: string;
  sort_order: number;
}

/**
 * Normalized product data returned by any provider.
 * All financial values are in PAISE (integer) to avoid floating-point issues.
 */
export interface ProviderProduct {
  asin?: string;                    // Amazon-specific
  merchant: string;                 // 'amazon', 'flipkart', etc.
  title: string;
  brand?: string;
  description?: string;
  model_number?: string;
  price_paise?: number;             // Current price × 100
  original_price_paise?: number;    // MRP × 100
  currency: string;                 // 'INR'
  rating?: number;
  review_count?: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED' | 'UNKNOWN';
  amazon_url?: string;
  images: ProviderProductImage[];
  specifications: ProviderProductSpec[];
  category_hint?: string;           // Provider's own category string (for classification)
  raw_data?: Record<string, unknown>; // Original API response (for debugging)
}

/**
 * Abstract interface every product data provider must implement.
 * Add FlipkartProductProvider, CuelinksProvider etc. by implementing this.
 */
export interface ProductDataProvider {
  /** Human-readable merchant identifier */
  readonly merchant: string;

  /** Fetch product data by ASIN or equivalent ID */
  fetchProduct(id: string): Promise<ProviderProduct | null>;

  /** Search products (optional — not all providers support this) */
  searchProducts?(query: string, limit?: number): Promise<ProviderProduct[]>;
}

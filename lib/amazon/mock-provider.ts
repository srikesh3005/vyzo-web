/**
 * Vyzo — Mock Amazon Product Provider
 * Used when AMAZON_USE_MOCK=true or PA-API credentials are not configured.
 * Returns realistic structured data so the rest of the system can be tested
 * without live API credentials.
 */

import type { ProductDataProvider, ProviderProduct } from './types';

const MOCK_PRODUCTS: Record<string, ProviderProduct> = {
  DEFAULT: {
    asin: 'B0MOCK00001',
    merchant: 'amazon',
    title: 'Sample Product (Mock)',
    brand: 'Mock Brand',
    description: 'This is a mock product returned because Amazon PA-API credentials are not configured. Set AMAZON_USE_MOCK=false and provide PA-API credentials to fetch real product data.',
    model_number: 'MOCK-001',
    price_paise: 99900,           // ₹999.00
    original_price_paise: 149900, // ₹1499.00
    currency: 'INR',
    rating: 4.2,
    review_count: 1250,
    availability: 'IN_STOCK',
    amazon_url: 'https://www.amazon.in/dp/B0MOCK00001',
    images: [
      {
        url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnail_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200',
        is_primary: true,
        sort_order: 0,
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Mock Brand', sort_order: 0 },
      { name: 'Model', value: 'MOCK-001', sort_order: 1 },
    ],
    category_hint: 'Electronics',
  },
};

export class MockAmazonProvider implements ProductDataProvider {
  readonly merchant = 'amazon';

  async fetchProduct(asin: string): Promise<ProviderProduct | null> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));

    const product = MOCK_PRODUCTS[asin] || {
      ...MOCK_PRODUCTS.DEFAULT,
      asin,
      amazon_url: `https://www.amazon.in/dp/${asin}`,
    };

    return product;
  }

  async searchProducts(query: string, limit = 10): Promise<ProviderProduct[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [{ ...MOCK_PRODUCTS.DEFAULT, title: `Mock result for: ${query}` }].slice(0, limit);
  }
}

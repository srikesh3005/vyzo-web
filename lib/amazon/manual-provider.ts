import type { ProductDataProvider, ProviderProduct } from './types';
import { extractAmazonAsin } from './asin';

export class AmazonManualProvider implements ProductDataProvider {
  async fetchProduct(asinOrUrl: string): Promise<ProviderProduct | null> {
    const asin = asinOrUrl.includes('http') ? extractAmazonAsin(asinOrUrl) : asinOrUrl;
    if (!asin) return null;

    // Return a basic skeleton to satisfy the MVP without scraping
    return {
      asin,
      title: 'Imported Amazon Product',
      brand: null,
      description: null,
      model_number: null,
      category_hint: null,
      price_paise: null,
      original_price_paise: null,
      currency: 'INR',
      rating: null,
      review_count: null,
      availability: 'UNKNOWN',
      images: [],
      specifications: [],
    };
  }
}

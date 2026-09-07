/**
 * Vyzo — Product Provider Factory
 * Returns the correct provider based on environment configuration.
 * Add new providers here as new merchants are onboarded.
 */

import type { ProductDataProvider } from './types';
import { AmazonScraperProvider } from './scraper-provider';

// Lazy-loaded to avoid importing crypto in edge runtimes unexpectedly
let _amazonProvider: ProductDataProvider | null = null;

function getAmazonProvider(): ProductDataProvider {
  // Use scraper provider instead of manual (since PA-API is disabled)
  const useScraper = true;

  if (useScraper) {
    return new AmazonScraperProvider();
  }

  if (!_amazonProvider) {
    // Dynamic import to avoid crypto issues in edge runtime
    const { AmazonProductProvider } = require('./amazon-provider');
    _amazonProvider = new AmazonProductProvider();
  }
  return _amazonProvider!;
}

const PROVIDERS: Record<string, () => ProductDataProvider> = {
  amazon: getAmazonProvider,
  // flipkart: getFlipkartProvider,  -- add here when ready
};

/**
 * Get the product data provider for a given merchant.
 * Defaults to 'amazon' if merchant is not specified.
 */
export function getProductProvider(merchant = 'amazon'): ProductDataProvider {
  const factory = PROVIDERS[merchant.toLowerCase()];
  if (!factory) {
    throw new Error(`No product provider registered for merchant: ${merchant}`);
  }
  return factory();
}

export type { ProductDataProvider };
export type { ProviderProduct } from './types';

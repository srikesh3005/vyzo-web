import * as cheerio from 'cheerio';
import type { ProductDataProvider, ProviderProduct } from './types';
import { extractAmazonAsin } from './asin';

export class AmazonScraperProvider implements ProductDataProvider {
  async fetchProduct(asinOrUrl: string): Promise<ProviderProduct | null> {
    const asin = asinOrUrl.includes('http') ? extractAmazonAsin(asinOrUrl) : asinOrUrl;
    if (!asin) return null;

    try {
      const url = `https://www.amazon.in/dp/${asin}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Title
      const title = $('#productTitle').text().trim() || 
                    $('meta[name="title"]').attr('content') || 
                    $('title').text().replace(' : Amazon.in', '').trim();

      // Brand
      let brand = $('#bylineInfo').text().replace('Visit the ', '').replace(' Store', '').trim() || 
                  $('a#bylineInfo').text().replace('Brand: ', '').trim();
      
      // Price (Paise)
      let price = null;
      const priceText = $('.a-price .a-offscreen').first().text().replace(/[^\d.]/g, '');
      if (priceText) {
        price = Math.round(parseFloat(priceText) * 100);
      }

      // MRP (Paise)
      let mrp = null;
      const mrpText = $('.a-text-strike').first().text().replace(/[^\d.]/g, '');
      if (mrpText) {
        mrp = Math.round(parseFloat(mrpText) * 100);
      }

      // Main Image
      let images = [];
      const mainImageUrl = $('#landingImage').attr('src') || $('img#imgBlkFront').attr('src') || $('meta[property="og:image"]').attr('content');
      if (mainImageUrl) {
        images.push({
          url: mainImageUrl,
          is_primary: true,
          sort_order: 0
        });
      }
      
      // Description/Features
      const description = $('#feature-bullets ul li span.a-list-item').map((i, el) => $(el).text().trim()).get().join('. ');
      
      // Category Hint
      const categoryHint = $('#wayfinding-breadcrumbs_feature_div ul li a.a-link-normal.a-color-tertiary').last().text().trim();

      return {
        asin,
        title: title || 'Imported Amazon Product',
        brand: brand || 'Amazon',
        description: description || null,
        model_number: null,
        category_hint: categoryHint || null,
        price_paise: price || null,
        original_price_paise: mrp || null,
        currency: 'INR',
        rating: null,
        review_count: null,
        availability: 'UNKNOWN',
        images,
        specifications: [],
      };
    } catch (error) {
      console.error('Scraping error:', error);
      // Fallback to manual if scraping fails (e.g. CAPTCHA)
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
}

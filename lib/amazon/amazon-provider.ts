/**
 * Vyzo — Amazon PA-API v5 Product Provider
 * Official Amazon Product Advertising API integration.
 * Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG
 *
 * Docs: https://webservices.amazon.com/paapi5/documentation/
 *
 * NOTE: PA-API v5 uses AWS Signature v4 for authentication.
 * We sign requests manually to avoid large SDK dependencies.
 */

import crypto from 'crypto';
import type { ProductDataProvider, ProviderProduct, ProviderProductImage, ProviderProductSpec } from './types';

const PA_API_HOST = 'webservices.amazon.in';
const PA_API_REGION = 'eu-west-1';  // Amazon India PA-API endpoint region
const PA_API_ENDPOINT = `https://${PA_API_HOST}`;
const PA_API_PATH = '/paapi5/getitems';
const SERVICE = 'ProductAdvertisingAPI';

interface PAAPIConfig {
  accessKey: string;
  secretKey: string;
  associateTag: string;
}

// ─── AWS Signature V4 ────────────────────────────────────────────────────────

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmac('AWS4' + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function buildAuthHeader(
  config: PAAPIConfig,
  method: string,
  path: string,
  payload: string,
  now: Date
): Record<string, string> {
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = hash(payload);
  const headers: Record<string, string> = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host: PA_API_HOST,
    'x-amz-date': amzDate,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
  };

  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

  const credentialScope = `${dateStamp}/${PA_API_REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, hash(canonicalRequest)].join('\n');

  const signingKey = getSignatureKey(config.secretKey, dateStamp, PA_API_REGION, SERVICE);
  const signature = hmac(signingKey, stringToSign).toString('hex');

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    ...headers,
    Authorization: authorizationHeader,
  };
}

// ─── Response Normalization ────────────────────────────────────────────────────

function normalizeImages(item: Record<string, unknown>): ProviderProductImage[] {
  const images: ProviderProductImage[] = [];
  const imageSet = (item.Images as Record<string, unknown>)?.Primary as Record<string, unknown>;

  if (imageSet?.Large) {
    const large = imageSet.Large as { URL: string };
    const small = (imageSet.Small as { URL: string } | undefined);
    images.push({
      url: large.URL,
      thumbnail_url: small?.URL,
      is_primary: true,
      sort_order: 0,
    });
  }

  const variants = ((item.Images as Record<string, unknown>)?.Variants as Record<string, unknown>[]) || [];
  variants.forEach((v, i) => {
    const large = (v.Large as { URL: string } | undefined);
    if (large?.URL) {
      images.push({
        url: large.URL,
        is_primary: false,
        sort_order: i + 1,
      });
    }
  });

  return images;
}

function normalizeSpecs(item: Record<string, unknown>): ProviderProductSpec[] {
  const specs: ProviderProductSpec[] = [];
  const features = item.ItemInfo as Record<string, unknown>;

  const techSpecs = (features?.TechnicalInfo as Record<string, unknown>)?.Formats as { DisplayValues?: string[] } | undefined;
  if (techSpecs?.DisplayValues) {
    techSpecs.DisplayValues.forEach((v, i) => {
      specs.push({ name: `Feature ${i + 1}`, value: v, sort_order: i });
    });
  }

  const byline = (features?.ByLineInfo as Record<string, unknown>)?.Brand as { DisplayValue?: string } | undefined;
  if (byline?.DisplayValue) {
    specs.push({ name: 'Brand', value: byline.DisplayValue, sort_order: -1 });
  }

  return specs;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class AmazonProductProvider implements ProductDataProvider {
  readonly merchant = 'amazon';
  private config: PAAPIConfig;

  constructor() {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const associateTag = process.env.AMAZON_ASSOCIATE_TAG;

    if (!accessKey || !secretKey || !associateTag) {
      throw new Error(
        'Amazon PA-API credentials missing. Set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG.'
      );
    }
    this.config = { accessKey, secretKey, associateTag };
  }

  async fetchProduct(asin: string): Promise<ProviderProduct | null> {
    const payload = JSON.stringify({
      ItemIds: [asin],
      PartnerTag: this.config.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
      Resources: [
        'BrowseNodeInfo.BrowseNodes',
        'Images.Primary.Large',
        'Images.Primary.Small',
        'Images.Variants.Large',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ContentInfo',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'Offers.Listings.MerchantInfo',
        'Offers.Summaries.LowestPrice',
      ],
    });

    const now = new Date();
    const headers = buildAuthHeader(this.config, 'POST', PA_API_PATH, payload, now);

    const res = await fetch(`${PA_API_ENDPOINT}${PA_API_PATH}`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`PA-API error ${res.status}: ${errorBody}`);
    }

    const data = await res.json() as Record<string, unknown>;
    const items = (data.ItemsResult as Record<string, unknown>)?.Items as Record<string, unknown>[] | undefined;

    if (!items || items.length === 0) return null;

    const item = items[0];
    const info = item.ItemInfo as Record<string, unknown> | undefined;
    const offers = item.Offers as Record<string, unknown> | undefined;
    const listing = (offers?.Listings as Record<string, unknown>[])?.[0];
    const price = listing?.Price as { Amount?: number; DisplayAmount?: string } | undefined;
    const summaries = offers?.Summaries as Record<string, unknown>[] | undefined;
    const lowestPrice = summaries?.[0]?.LowestPrice as { Amount?: number } | undefined;

    const titleInfo = (info?.Title as { DisplayValue?: string } | undefined);
    const brand = ((info?.ByLineInfo as Record<string, unknown>)?.Brand as { DisplayValue?: string } | undefined);
    const features = (info?.Features as { DisplayValues?: string[] } | undefined);
    const browseNodes = (item.BrowseNodeInfo as Record<string, unknown>)?.BrowseNodes as { DisplayName?: string }[] | undefined;

    const pricePaise = price?.Amount ? Math.round(price.Amount * 100) : undefined;
    const originalPricePaise = lowestPrice?.Amount ? Math.round(lowestPrice.Amount * 100) : undefined;

    const availabilityMsg = (listing?.Availability as Record<string, unknown>)?.Message as string | undefined;
    let availability: ProviderProduct['availability'] = 'UNKNOWN';
    if (availabilityMsg) {
      const lower = availabilityMsg.toLowerCase();
      if (lower.includes('in stock')) availability = 'IN_STOCK';
      else if (lower.includes('out of stock')) availability = 'OUT_OF_STOCK';
      else if (lower.includes('limited')) availability = 'LIMITED';
    }

    return {
      asin: item.ASIN as string,
      merchant: 'amazon',
      title: titleInfo?.DisplayValue || 'Unknown Product',
      brand: brand?.DisplayValue,
      description: features?.DisplayValues?.join('. '),
      price_paise: pricePaise,
      original_price_paise: originalPricePaise,
      currency: 'INR',
      availability,
      amazon_url: item.DetailPageURL as string || `https://www.amazon.in/dp/${asin}`,
      images: normalizeImages(item),
      specifications: normalizeSpecs(item),
      category_hint: browseNodes?.[0]?.DisplayName,
      raw_data: item,
    };
  }
}

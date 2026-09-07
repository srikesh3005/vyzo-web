/**
 * Tests for lib/amazon/asin.ts
 * Run: npx jest __tests__/asin.test.ts
 */

import {
  extractAmazonAsin,
  isAmazonInUrl,
  isAmazonUrl,
  normalizeAmazonUrl,
  isValidAsin,
} from '../lib/amazon/asin';

describe('isValidAsin', () => {
  it('accepts valid ASINs', () => {
    expect(isValidAsin('B0XXXXXXXXXX'.slice(0, 10))).toBe(false); // only 10 chars
    expect(isValidAsin('B0C1D2E3F4')).toBe(true);
    expect(isValidAsin('0306406152')).toBe(true);
    expect(isValidAsin('B08N5WRWNW')).toBe(true);
  });

  it('rejects invalid ASINs', () => {
    expect(isValidAsin('B0C1D2E3')).toBe(false);    // too short
    expect(isValidAsin('B0C1D2E3F45')).toBe(false); // too long
    expect(isValidAsin('B0C1D2E3F!')).toBe(false);  // invalid char
    expect(isValidAsin('')).toBe(false);
  });
});

describe('extractAmazonAsin', () => {
  const ASIN = 'B08N5WRWNW';

  const validUrls = [
    `https://www.amazon.in/dp/${ASIN}`,
    `https://www.amazon.in/dp/${ASIN}/`,
    `https://www.amazon.in/dp/${ASIN}?ref=sxts`,
    `https://www.amazon.in/Some-Product-Name/dp/${ASIN}`,
    `https://www.amazon.in/Some-Product-Name/dp/${ASIN}/ref=something`,
    `https://www.amazon.in/gp/product/${ASIN}`,
    `https://www.amazon.in/gp/product/${ASIN}?th=1`,
    `https://amazon.in/dp/${ASIN}`,
    `https://www.amazon.in/exec/obidos/ASIN/${ASIN}`,
    `https://www.amazon.in/dp/${ASIN}?tag=partner-21&linkId=abc`,
  ];

  validUrls.forEach((url) => {
    it(`extracts ASIN from: ${url}`, () => {
      expect(extractAmazonAsin(url)).toBe(ASIN);
    });
  });

  const invalidUrls = [
    'https://www.amazon.com/dp/B08N5WRWNW',   // .com not .in
    'https://www.flipkart.com/product/B08N5WRWNW',
    'https://www.amazon.in/dp/',              // missing ASIN
    'not-a-url',
    '',
    'https://www.amazon.in/dp/TOOSHORT',      // ASIN too short
    'https://www.amazon.in/dp/TOOLONGASIN1',  // ASIN too long
  ];

  invalidUrls.forEach((url) => {
    it(`returns null for invalid URL: ${url}`, () => {
      expect(extractAmazonAsin(url)).toBeNull();
    });
  });
});

describe('isAmazonInUrl', () => {
  it('accepts amazon.in and www.amazon.in', () => {
    expect(isAmazonInUrl('https://www.amazon.in/dp/B08N5WRWNW')).toBe(true);
    expect(isAmazonInUrl('https://amazon.in/dp/B08N5WRWNW')).toBe(true);
  });

  it('rejects other domains', () => {
    expect(isAmazonInUrl('https://www.amazon.com/dp/B08N5WRWNW')).toBe(false);
    expect(isAmazonInUrl('https://www.amazon.co.uk/dp/B08N5WRWNW')).toBe(false);
    expect(isAmazonInUrl('https://flipkart.com/')).toBe(false);
    expect(isAmazonInUrl('not-a-url')).toBe(false);
  });
});

describe('isAmazonUrl', () => {
  it('detects Amazon URLs in search queries', () => {
    expect(isAmazonUrl('https://www.amazon.in/dp/B08N5WRWNW')).toBe(true);
    expect(isAmazonUrl('best laptop under 50000')).toBe(false);
    expect(isAmazonUrl('')).toBe(false);
  });
});

describe('normalizeAmazonUrl', () => {
  it('normalizes Amazon URLs to clean canonical form', () => {
    const ASIN = 'B08N5WRWNW';
    expect(normalizeAmazonUrl(`https://www.amazon.in/Some-Product/dp/${ASIN}?ref=abc&tag=old`))
      .toBe(`https://www.amazon.in/dp/${ASIN}`);
  });

  it('returns null for invalid URLs', () => {
    expect(normalizeAmazonUrl('https://www.amazon.com/dp/B08N5WRWNW')).toBeNull();
    expect(normalizeAmazonUrl('not-a-url')).toBeNull();
  });
});

import { extractAmazonAsin, isAmazonUrl, generateAmazonAffiliateUrl } from '@/lib/amazon/asin';

describe('Amazon URL Resolver', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.AMAZON_ASSOCIATE_TAG = 'vyzoai-21';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isAmazonUrl', () => {
    it('detects standard amazon urls', () => {
      expect(isAmazonUrl('https://www.amazon.in/dp/B0GXBG2MNF')).toBe(true);
      expect(isAmazonUrl('https://amazon.in/dp/B0GXBG2MNF')).toBe(true);
    });

    it('detects short urls', () => {
      expect(isAmazonUrl('https://amzn.in/d/03vqG7NW')).toBe(true);
      expect(isAmazonUrl('https://link.amazon/B040MWu0H')).toBe(true);
    });

    it('rejects non-amazon urls', () => {
      expect(isAmazonUrl('https://example.com/product')).toBe(false);
      expect(isAmazonUrl('best wireless earbuds')).toBe(false);
    });
  });

  describe('extractAmazonAsin', () => {
    it('extracts ASIN from standard URL', () => {
      expect(extractAmazonAsin('https://www.amazon.in/dp/B0GXBG2MNF')).toBe('B0GXBG2MNF');
    });

    it('extracts ASIN from long URL with tracking params', () => {
      expect(
        extractAmazonAsin(
          'https://www.amazon.in/boAt-Airdopes-Immersive-Hearables-Assistant/dp/B0GXBG2MNF?_encoding=UTF8&pd_rd_w=xyz&pf_rd_p=abc'
        )
      ).toBe('B0GXBG2MNF');
    });

    it('extracts ASIN from gp/product URL', () => {
      expect(extractAmazonAsin('https://www.amazon.in/gp/product/B0GXBG2MNF?th=1')).toBe('B0GXBG2MNF');
    });

    it('returns null for short urls (requires resolution)', () => {
      // Short URLs do not contain the ASIN in the path
      expect(extractAmazonAsin('https://amzn.in/d/03vqG7NW')).toBeNull();
    });

    it('returns null for invalid urls', () => {
      expect(extractAmazonAsin('https://example.com')).toBeNull();
    });
  });

  describe('generateAmazonAffiliateUrl', () => {
    it('generates the correct URL with the configured tag', () => {
      expect(generateAmazonAffiliateUrl('B0GXBG2MNF')).toBe(
        'https://www.amazon.in/dp/B0GXBG2MNF?tag=vyzoai-21'
      );
    });
  });
});

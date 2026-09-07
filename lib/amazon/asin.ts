/**
 * Vyzo — Amazon ASIN Extractor
 *
 * Supports all common Amazon India URL formats.
 * Does NOT rely on string splitting — uses regex for robustness.
 *
 * Supported formats:
 *   https://www.amazon.in/dp/B0XXXXXXXX
 *   https://www.amazon.in/gp/product/B0XXXXXXXX
 *   https://amazon.in/dp/B0XXXXXXXX
 *   https://www.amazon.in/Some-Product-Name/dp/B0XXXXXXXX
 *   https://www.amazon.in/dp/B0XXXXXXXX?ref=...
 *   https://www.amazon.in/gp/product/B0XXXXXXXX?th=1
 *   amzn.in short links (redirected, not extractable without HTTP)
 */

/** Allowed Amazon India domains */
export const ALLOWED_AMAZON_DOMAINS = [
  'amazon.in',
  'www.amazon.in',
  'amzn.in', // short URL domain
  'link.amazon', // short URL domain
] as const;

/**
 * Regex patterns for ASIN extraction.
 * Amazon ASINs are exactly 10 characters: uppercase letters and digits.
 */
const ASIN_PATTERNS = [
  // /dp/ASIN or /dp/ASIN/ (most common)
  /\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/,
  // /gp/product/ASIN
  /\/gp\/product\/([A-Z0-9]{10})(?:[/?#]|$)/,
  // /product/ASIN (less common)
  /\/product\/([A-Z0-9]{10})(?:[/?#]|$)/,
  // /exec/obidos/ASIN/ASIN (legacy)
  /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?:[/?#]|$)/,
  // Query param: ?asin=ASIN
  /[?&]asin=([A-Z0-9]{10})(?:&|$)/i,
];

/** ASIN format validation — exactly 10 alphanumeric uppercase chars */
const ASIN_REGEX = /^[A-Z0-9]{10}$/;

export function isValidAsin(asin: string): boolean {
  return ASIN_REGEX.test(asin);
}

/**
 * Extract ASIN from an Amazon URL.
 * Returns null if the URL is not a valid Amazon India URL or ASIN cannot be found.
 */
export function extractAmazonAsin(url: string): string | null {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return null;
  }

  // Validate domain
  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  if (!ALLOWED_AMAZON_DOMAINS.includes(host as any)) {
    return null;
  }

  // Try each pattern against the full URL (path + query)
  const pathAndQuery = parsedUrl.pathname + parsedUrl.search;

  for (const pattern of ASIN_PATTERNS) {
    const match = pathAndQuery.match(pattern);
    if (match && match[1] && isValidAsin(match[1])) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate that a URL is a supported Amazon India domain.
 * Does NOT check if ASIN is present.
 */
export function isAmazonInUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    return ALLOWED_AMAZON_DOMAINS.includes(host as any);
  } catch {
    return false;
  }
}

/**
 * Detect if a search query is an Amazon URL.
 * Used by the search bar to switch between search and import modes.
 */
export function isAmazonUrl(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed.startsWith('http')) return false;
  return isAmazonInUrl(trimmed);
}

/**
 * Resolves a shortened Amazon URL (like amzn.in/d/...) to its full URL and extracts the ASIN.
 * Required because shortened URLs don't contain the ASIN in their path.
 */
export async function resolveAmazonUrl(url: string): Promise<string | null> {
  const trimmed = url.trim();
  
  // If it already has an ASIN, we don't need to resolve it
  const existingAsin = extractAmazonAsin(trimmed);
  if (existingAsin) return existingAsin;

  try {
    // We need to fetch the URL and see where it redirects
    const response = await fetch(trimmed, {
      method: 'GET', // Amazon shortlinks return 404 for HEAD requests
      redirect: 'follow', // Follow redirects to get the final URL
    });
    
    // Check the final URL after redirects
    const finalUrl = response.url;
    return extractAmazonAsin(finalUrl);
  } catch (error) {
    console.error('Failed to resolve Amazon URL:', error);
    return null;
  }
}

/**
 * Normalize an Amazon URL to a clean canonical form.
 * Strips tracking parameters, affiliate tags, etc.
 * Returns null if ASIN cannot be extracted.
 */
export async function normalizeAmazonUrl(url: string): Promise<string | null> {
  const asin = await resolveAmazonUrl(url);
  if (!asin) return null;
  return `https://www.amazon.in/dp/${asin}`;
}

/**
 * Generate a Vyzo affiliate URL from an ASIN.
 * Uses the AMAZON_ASSOCIATE_TAG environment variable, or a fallback if not configured.
 */
export function generateAmazonAffiliateUrl(asin: string): string {
  const tag = process.env.AMAZON_ASSOCIATE_TAG || 'vyzoai-21';
  return `https://www.amazon.in/dp/${asin}?tag=${tag}`;
}

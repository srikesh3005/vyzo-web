/**
 * Vyzo — Slug Generator
 * Generates URL-safe slugs for products.
 */

export function generateSlug(title: string, asin?: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // remove non-word chars
    .replace(/[\s_-]+/g, '-')    // replace spaces/underscores with dash
    .replace(/^-+|-+$/g, '')     // trim leading/trailing dashes
    .slice(0, 60);               // max 60 chars for slug

  const suffix = asin ? `-${asin.toLowerCase()}` : `-${Date.now().toString(36)}`;
  return `${base}${suffix}`;
}

/**
 * Format paise to INR display string.
 * @param paise Integer paise value (e.g. 99900 = ₹999.00)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

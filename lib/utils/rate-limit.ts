/**
 * Vyzo — Rate Limiter
 * In-memory rate limiting for MVP.
 * Upgrade path: swap the in-memory store for Redis when REDIS_URL is set.
 *
 * Two strategies:
 * - Per-user: keyed by user ID
 * - Per-IP: keyed by IP address
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (process-local — fine for single instance MVP)
const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    });
  }, 60000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 * @param key Unique key (e.g., 'import-url:user:uuid' or 'import-url:ip:1.2.3.4')
 * @param limit Maximum requests allowed
 * @param windowSeconds Time window in seconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// ─── Pre-configured Rate Limiters ────────────────────────────────────────────

/**
 * Import URL: max 10 per user per hour, max 20 per IP per hour.
 * Protects against Amazon PA-API abuse.
 */
export function rateLimit_importUrl(userId: string | null, ip: string): RateLimitResult {
  if (userId) {
    const result = checkRateLimit(`import-url:user:${userId}`, 10, 3600);
    if (!result.allowed) return result;
  }
  return checkRateLimit(`import-url:ip:${ip}`, 20, 3600);
}

/**
 * Search: max 100 per IP per minute.
 */
export function rateLimit_search(ip: string): RateLimitResult {
  return checkRateLimit(`search:ip:${ip}`, 100, 60);
}

/**
 * Affiliate click: max 50 per user per hour.
 */
export function rateLimit_affiliateClick(userId: string | null, ip: string): RateLimitResult {
  if (userId) {
    return checkRateLimit(`click:user:${userId}`, 50, 3600);
  }
  return checkRateLimit(`click:ip:${ip}`, 20, 3600);
}

/**
 * Auth: max 10 login attempts per IP per 15 minutes.
 */
export function rateLimit_auth(ip: string): RateLimitResult {
  return checkRateLimit(`auth:ip:${ip}`, 10, 900);
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

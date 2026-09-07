/**
 * GET /api/v1/search/autocomplete?q=
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { getClientIp, checkRateLimit } from '@/lib/utils/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`autocomplete:ip:${ip}`, 200, 60);
  if (!rl.allowed) return Errors.rateLimited();

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q || q.length < 2) return successResponse([]);

  const { data } = await db.from('products')
    .select('title, brand_name, slug, asin')
    .eq('status', 'published')
    .ilike('title', `${q}%`)
    .limit(8);

  const { data: brands } = await db.from('products')
    .select('brand_name')
    .eq('status', 'published')
    .ilike('brand_name', `${q}%`)
    .limit(4);

  const productSuggestions = (data ?? []).map((p: any) => ({
    type: 'product',
    text: p.title,
    slug: p.slug,
    asin: p.asin,
    brand: p.brand_name,
  }));

  const brandSuggestions = Array.from(new Set((brands ?? []).map((b: any) => b.brand_name).filter(Boolean))).map((b: any) => ({
    type: 'brand',
    text: b,
    slug: null,
    asin: null,
    brand: null,
  }));

  return successResponse([...productSuggestions, ...brandSuggestions].slice(0, 10));
}

/**
 * GET /api/v1/search
 * Main search endpoint — detects Amazon URLs or does full-text search.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { rateLimit_search, getClientIp } from '@/lib/utils/rate-limit';
import { isAmazonUrl } from '@/lib/amazon/asin';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit_search(ip);
  if (!rl.allowed) return Errors.rateLimited();

  const { searchParams } = req.nextUrl;
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, parseInt(searchParams.get('per_page') || '20', 10));
  const category = searchParams.get('category') ?? undefined;

  if (!q) return Errors.badRequest('Search query is required.', 'MISSING_QUERY');

  // Amazon URL detection
  if (isAmazonUrl(q)) {
    return successResponse([], {
      redirect_to_import: true,
      message: 'Amazon URL detected. Use POST /api/v1/products/import-url to import this product.',
      url: q,
      total: 0,
    });
  }

  const offset = (page - 1) * perPage;

  let query = db.from('products')
    .select('id, slug, asin, title, brand_name, price_paise, original_price_paise, currency, rating, review_count, availability, estimated_reward_paise, ai_summary, is_trending, images:product_images(url, is_primary, sort_order), category:categories!products_category_id_fkey(id, slug, name)', { count: 'exact' })
    .eq('status', 'published')
    .or(`title.ilike.%${q}%,brand_name.ilike.%${q}%,asin.ilike.%${q}%`);

  if (category) {
    const { data: cat } = await db.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  query = query.order('rating', { ascending: false, nullsFirst: false }).range(offset, offset + perPage - 1);

  const { data, error, count } = await query;
  if (error) return Errors.internal();

  return successResponse(
    (data ?? []).map((p: any) => ({
      id: p.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
      price: p.price_paise ? (p.price_paise as number) / 100 : null,
      mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
      currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
      in_stock: p.availability === 'IN_STOCK',
      estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
      ai_summary: p.ai_summary, is_trending: p.is_trending, category: p.category,
      image: (p.images as Array<{ url: string; is_primary: boolean }> | null)?.find((i) => i.is_primary)?.url ?? null,
      images: p.images,
    })),
    { total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage), query: q }
  );
}

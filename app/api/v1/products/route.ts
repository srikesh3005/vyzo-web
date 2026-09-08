/**
 * GET /api/v1/products
 * Paginated product list with filters.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { rateLimit_search, getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit_search(ip);
  if (!rl.allowed) return Errors.rateLimited();

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '24', 10)));
  const category = searchParams.get('category') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined;
  const ratingMin = searchParams.get('rating_min') ? parseFloat(searchParams.get('rating_min')!) : undefined;
  const inStock = searchParams.get('in_stock') === 'true' ? true : undefined;
  const sort = searchParams.get('sort') || 'newest';
  const status = searchParams.get('status') || 'published';

  let query = db
    .from('products')
    .select(`
      id, slug, asin, title, brand_name, price_paise, original_price_paise, currency,
      rating, review_count, availability, amazon_url,
      commission_rate, estimated_commission_paise, estimated_reward_paise,
      ai_summary, ai_recommendation_score,
      status, is_trending, is_featured, is_editors_pick, is_best_seller,
      category:categories!products_category_id_fkey(id, slug, name),
      images:product_images(url, thumbnail_url, is_primary, sort_order)
    `, { count: 'exact' })
    .eq('status', status);

  if (category) {
    const { data: cat } = await db.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (brand) query = query.ilike('brand_name', `%${brand}%`);
  if (priceMin !== undefined) query = query.gte('price_paise', Math.round(priceMin * 100));
  if (priceMax !== undefined) query = query.lte('price_paise', Math.round(priceMax * 100));
  if (ratingMin !== undefined) query = query.gte('rating', ratingMin);
  if (inStock) query = query.eq('availability', 'IN_STOCK');

  // Sorting
  switch (sort) {
    case 'price_asc':   query = query.order('price_paise', { ascending: true }); break;
    case 'price_desc':  query = query.order('price_paise', { ascending: false }); break;
    case 'rating':      query = query.order('rating', { ascending: false }); break;
    case 'trending':    query = query.eq('is_trending', true).order('view_count', { ascending: false }); break;
    case 'relevance':
    case 'newest':
    default:            query = query.order('created_at', { ascending: false }); break;
  }

  const offset = (page - 1) * perPage;
  query = query.range(offset, offset + perPage - 1);

  const { data, error, count } = await query;
  if (error) return Errors.internal();

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return successResponse(
    normalizeList(data ?? []),
    {
      total: count ?? 0,
      page,
      per_page: perPage,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    }
  );
}

function normalizeList(rows: Record<string, unknown>[]) {
  return rows.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    asin: p.asin,
    name: p.title,
    brand: p.brand_name,
    price: p.price_paise ? (p.price_paise as number) / 100 : null,
    mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
    currency: p.currency || 'INR',
    rating: p.rating,
    review_count: p.review_count,
    in_stock: p.availability === 'IN_STOCK',
    amazon_url: p.amazon_url,
    estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
    ai_summary: p.ai_summary,
    ai_recommendation_score: p.ai_recommendation_score,
    is_trending: p.is_trending,
    is_featured: p.is_featured,
    is_editors_pick: p.is_editors_pick,
    is_best_seller: p.is_best_seller,
    category: p.category,
    image: getPrimaryImage(p.images as Array<{ url: string; is_primary: boolean; sort_order: number }> | null),
    images: p.images,
  }));
}

function getPrimaryImage(images: Array<{ url: string; is_primary: boolean; sort_order: number }> | null): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary);
  return primary?.url ?? images.sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}

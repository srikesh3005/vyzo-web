/**
 * GET /api/v1/products/trending
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { successResponse, Errors } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get('limit') || '8', 10));

  try {
    const snapshot = await db
      .collection('products')
      .where('status', '==', 'published')
      .where('is_trending', '==', true)
      .limit(limit)
      .get();

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return successResponse(normalizeList((data ?? []) as Record<string, unknown>[]));
  } catch (error) {
    return Errors.internal();
  }
}

function normalizeList(rows: Record<string, unknown>[]) {
  return rows.map((p) => ({
    id: p.id, slug: p.slug, asin: p.asin,
    name: p.title, brand: p.brand_name,
    price: p.price_paise ? (p.price_paise as number) / 100 : null,
    mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
    currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
    in_stock: p.availability === 'IN_STOCK',
    estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
    ai_summary: p.ai_summary, is_trending: p.is_trending, is_featured: p.is_featured,
    category: p.category,
    image: getPrimary(p.images as Array<{ url: string; is_primary: boolean }> | null),
    images: p.images,
  }));
}

function getPrimary(images: Array<{ url: string; is_primary: boolean }> | null): string | null {
  if (!images?.length) return null;
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
}

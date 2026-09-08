/**
 * GET /api/v1/me/recently-viewed
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/utils/auth-server';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') || '20', 10));

  const { data, error } = await db.from('recently_viewed')
    .select(`viewed_at, product:products(id, slug, asin, title, brand_name, price_paise, currency, rating, availability, estimated_reward_paise, ai_summary, images:product_images(url, is_primary))`)
    .eq('user_id', user.sub)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) return Errors.internal();

  return successResponse((data ?? []).map((item: any) => {
    const p = item.product as unknown as Record<string, unknown>;
    return {
      viewed_at: item.viewed_at,
      product: {
        id: p.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
        price: p.price_paise ? (p.price_paise as number) / 100 : null,
        currency: p.currency || 'INR', rating: p.rating, in_stock: p.availability === 'IN_STOCK',
        estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
        ai_summary: p.ai_summary,
        image: (p.images as Array<{ url: string; is_primary: boolean }> | null)?.find((i) => i.is_primary)?.url ?? null,
      },
    };
  }));
}

/**
 * GET  /api/v1/me/wishlist  — Get user's wishlist
 * POST /api/v1/me/wishlist  — Add product to wishlist
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/utils/auth-server';

export const dynamic = "force-dynamic";

async function getOrCreateWishlist(userId: string) {
  const { data: existing } = await db.from('wishlists').select('id').eq('user_id', userId).eq('is_default', true).single();
  if (existing) return existing.id;
  const { data } = await db.from('wishlists').insert({ user_id: userId, name: 'My Wishlist', is_default: true }).select('id').single();
  return data!.id;
}

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  const wishlistId = await getOrCreateWishlist(user.sub);

  const { data, error } = await db.from('wishlist_items')
    .select(`added_at, product:products(id, slug, asin, title, brand_name, price_paise, original_price_paise, currency, rating, review_count, availability, estimated_reward_paise, ai_summary, images:product_images(url, is_primary, sort_order))`)
    .eq('wishlist_id', wishlistId)
    .order('added_at', { ascending: false });

  if (error) return Errors.internal();

  return successResponse((data ?? []).map((item: any) => {
    const p = item.product as unknown as Record<string, unknown>;
    return {
      added_at: item.added_at,
      product: {
        id: p.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
        price: p.price_paise ? (p.price_paise as number) / 100 : null,
        mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
        currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
        in_stock: p.availability === 'IN_STOCK',
        estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
        ai_summary: p.ai_summary,
        image: (p.images as Array<{ url: string; is_primary: boolean }> | null)?.find((i) => i.is_primary)?.url ?? null,
      },
    };
  }));
}

const AddSchema = z.object({ product_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest('product_id is required.');

  const wishlistId = await getOrCreateWishlist(user.sub);
  const { error } = await db.from('wishlist_items')
    .upsert({ wishlist_id: wishlistId, product_id: parsed.data.product_id }, { onConflict: 'wishlist_id,product_id' });

  if (error) return Errors.internal();
  return successResponse({ added: true }, undefined, 201);
}

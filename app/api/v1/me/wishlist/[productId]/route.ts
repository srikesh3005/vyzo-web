/**
 * DELETE /api/v1/me/wishlist/[productId]
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/utils/auth-server';

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  const { data: wishlist } = await db.from('wishlists').select('id').eq('user_id', user.sub).eq('is_default', true).single();
  if (!wishlist) return successResponse({ removed: true });

  await db.from('wishlist_items').delete().eq('wishlist_id', wishlist.id).eq('product_id', params.productId);
  return successResponse({ removed: true });
}

/**
 * GET  /api/v1/me  — Get current user profile
 * PUT  /api/v1/me  — Update profile
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAuth } from '@/lib/utils/auth-server';
import { AuthError } from '@/lib/utils/auth-server';

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  const { data, error } = await db.from('users')
    .select('id, email, username, full_name, avatar_url, bio, location, role, is_verified, preferences, created_at, updated_at')
    .eq('id', user.sub).single();

  if (error || !data) return Errors.notFound('User');

  // Get stats
  const [wishlistCount, recentlyViewedCount] = await Promise.all([
    db.from('wishlist_items').select('id', { count: 'exact' })
      .eq('wishlist_id', (await db.from('wishlists').select('id').eq('user_id', user.sub).single()).data?.id ?? ''),
    db.from('recently_viewed').select('id', { count: 'exact' }).eq('user_id', user.sub),
  ]);

  return successResponse({
    id: data.id, email: data.email, username: data.username, full_name: data.full_name,
    avatar_url: data.avatar_url, bio: data.bio, location: data.location,
    role: data.role, is_verified: data.is_verified, preferences: data.preferences,
    stats: { wishlist_count: wishlistCount.count ?? 0, recently_viewed_count: recentlyViewedCount.count ?? 0 },
    created_at: data.created_at, updated_at: data.updated_at,
  });
}

const UpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  preferences: z.record(z.unknown()).optional(),
}).strict();

export async function PUT(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input.');

  const { data, error } = await db.from('users')
    .update(parsed.data).eq('id', user.sub)
    .select('id, email, username, full_name, avatar_url, bio, location, role, is_verified, preferences, created_at, updated_at')
    .single();

  if (error) return Errors.internal();
  return successResponse(data);
}

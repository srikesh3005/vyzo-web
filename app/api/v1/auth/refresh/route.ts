/**
 * POST /api/v1/auth/refresh
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/utils/auth-server';
import crypto from 'crypto';

export const dynamic = "force-dynamic";

const RefreshSchema = z.object({ refresh_token: z.string() });

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = RefreshSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest('Refresh token required.');

  const { refresh_token } = parsed.data;
  const payload = await verifyRefreshToken(refresh_token);
  if (!payload) return Errors.unauthorized('Invalid or expired refresh token.');

  const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
  const { data: storedToken } = await db.from('refresh_tokens')
    .select('id, user_id, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .single();

  if (!storedToken || storedToken.revoked_at || new Date(storedToken.expires_at) < new Date()) {
    return Errors.unauthorized('Refresh token has been revoked or expired.');
  }

  const { data: user } = await db.from('users')
    .select('id, email, username, full_name, role, is_verified, avatar_url, is_active, created_at')
    .eq('id', storedToken.user_id)
    .single();

  if (!user || !user.is_active) return Errors.forbidden('Account not active.');

  // Rotate refresh token
  await db.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', storedToken.id);

  const [newAccessToken, newRefreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role as 'user' }),
    signRefreshToken(user.id),
  ]);

  const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await db.from('refresh_tokens').insert({
    user_id: user.id, token_hash: newHash,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return successResponse({
    user: { id: user.id, email: user.email, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, role: user.role, is_verified: user.is_verified, created_at: user.created_at },
    tokens: { access_token: newAccessToken, refresh_token: newRefreshToken, token_type: 'bearer', expires_in: 3600 },
  });
}

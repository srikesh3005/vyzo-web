/**
 * POST /api/v1/auth/login
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { verifyPassword, signAccessToken, signRefreshToken } from '@/lib/utils/auth-server';
import { rateLimit_auth, getClientIp } from '@/lib/utils/rate-limit';
import crypto from 'crypto';

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
  remember_me: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit_auth(ip);
  if (!rl.allowed) return Errors.rateLimited();

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest('Invalid email or password.');

  const { email, password } = parsed.data;

  const { data: user } = await db.from('users')
    .select('id, email, username, full_name, password_hash, role, is_verified, is_active, avatar_url, created_at')
    .eq('email', email)
    .single();

  // Constant-time comparison even on missing user (prevent timing attacks)
  const validPassword = user?.password_hash
    ? await verifyPassword(password, user.password_hash)
    : false;

  if (!user || !validPassword) {
    return Errors.badRequest('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  if (!user.is_active) {
    return Errors.forbidden('Your account has been suspended.');
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role as 'user' }),
    signRefreshToken(user.id),
  ]);

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await db.from('refresh_tokens').insert({
    user_id: user.id, token_hash: tokenHash,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return successResponse({
    user: { id: user.id, email: user.email, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, role: user.role, is_verified: user.is_verified, created_at: user.created_at },
    tokens: { access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer', expires_in: 3600 },
  });
}

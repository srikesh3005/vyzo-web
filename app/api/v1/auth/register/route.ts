/**
 * POST /api/v1/auth/register
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/utils/auth-server';
import { rateLimit_auth, getClientIp } from '@/lib/utils/rate-limit';
import crypto from 'crypto';

const RegisterSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  full_name: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i, 'Username can only contain letters, numbers and underscores.').optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit_auth(ip);
  if (!rl.allowed) return Errors.rateLimited();

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input.');

  const { email, password, full_name, username } = parsed.data;

  // Check existing
  const { data: existing } = await db.from('users').select('id').eq('email', email).single();
  if (existing) return Errors.conflict('An account with this email already exists.');

  const passwordHash = await hashPassword(password);
  const finalUsername = username ?? `user_${crypto.randomBytes(4).toString('hex')}`;

  const { data: user, error } = await db.from('users')
    .insert({ email, password_hash: passwordHash, full_name, username: finalUsername, role: 'user' })
    .select('id, email, username, full_name, role, is_verified, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return Errors.conflict('Username already taken.');
    return Errors.internal();
  }

  await Promise.resolve(db.from('wallets').insert({ user_id: user!.id, cached_balance_coins: 0 })).catch(() => {});

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user!.id, email: user!.email, role: user!.role as 'user' }),
    signRefreshToken(user!.id),
  ]);

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await db.from('refresh_tokens').insert({
    user_id: user!.id, token_hash: tokenHash,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return successResponse({
    user: { id: user!.id, email: user!.email, username: user!.username, full_name: user!.full_name, role: user!.role, is_verified: user!.is_verified, created_at: user!.created_at },
    tokens: { access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer', expires_in: 3600 },
  }, undefined, 201);
}

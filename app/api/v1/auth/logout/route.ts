/**
 * POST /api/v1/auth/logout
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse } from '@/lib/utils/response';
import crypto from 'crypto';

export const dynamic = "force-dynamic";

const LogoutSchema = z.object({ refresh_token: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LogoutSchema.safeParse(body);
    if (parsed.success && parsed.data.refresh_token) {
      const tokenHash = crypto.createHash('sha256').update(parsed.data.refresh_token).digest('hex');
      await db.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('token_hash', tokenHash);
    }
  } catch { /* ignore */ }

  return successResponse({ logged_out: true });
}

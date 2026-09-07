/**
 * GET  /api/v1/admin/commission-rules       — List rules
 * POST /api/v1/admin/commission-rules       — Create rule
 * PUT  /api/v1/admin/commission-rules/[id]  — Update rule (via separate route)
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAdmin, AuthError, logAudit } from '@/lib/utils/auth-server';
import { getClientIp } from '@/lib/utils/rate-limit';

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  const { data, error } = await db.from('commission_rules')
    .select('id, name, rate, maximum_reward, description, priority, is_active, category_id, category:categories(slug, name), created_at, updated_at')
    .order('priority', { ascending: false });

  if (error) return Errors.internal();
  return successResponse(data ?? []);
}

const CreateRuleSchema = z.object({
  name: z.string().min(2).max(200),
  category_id: z.string().uuid().optional().nullable(),
  rate: z.number().min(0).max(1),
  maximum_reward: z.number().positive().optional().nullable(),
  description: z.string().max(500).optional(),
  priority: z.number().int().min(0).default(50),
  is_active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  let admin;
  try { admin = await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = CreateRuleSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input.');

  const { data, error } = await db.from('commission_rules').insert(parsed.data).select('*').single();
  if (error) return Errors.internal(error.message);

  await logAudit({ userId: admin.sub, action: 'admin.commission_rule.create', entityType: 'commission_rule', entityId: data!.id, newData: parsed.data, ipAddress: getClientIp(req.headers) });

  return successResponse(data, undefined, 201);
}

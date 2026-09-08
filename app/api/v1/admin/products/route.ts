/**
 * GET  /api/v1/admin/products       — List all products (admin, includes draft/archived)
 * POST /api/v1/admin/products       — Create product manually
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAdmin, AuthError, logAudit } from '@/lib/utils/auth-server';
import { getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let admin;
  try { admin = await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const perPage = Math.min(100, parseInt(req.nextUrl.searchParams.get('per_page') || '50', 10));
  const status = req.nextUrl.searchParams.get('status');
  const q = req.nextUrl.searchParams.get('q');
  const offset = (page - 1) * perPage;

  let query = db.from('products')
    .select('id, asin, slug, title, brand_name, price_paise, currency, rating, review_count, availability, status, is_trending, is_featured, commission_rate, estimated_reward_paise, view_count, affiliate_click_count, submission_count, created_at, category:categories!products_category_id_fkey(slug, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query;
  if (error) return Errors.internal();

  return successResponse(data ?? [], { total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) });
}

const CreateProductSchema = z.object({
  title: z.string().min(3).max(500),
  asin: z.string().length(10).optional(),
  brand_name: z.string().max(100).optional(),
  price_paise: z.number().int().positive().optional(),
  original_price_paise: z.number().int().positive().optional(),
  amazon_url: z.string().url().optional(),
  affiliate_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'unpublished', 'archived']).default('draft'),
});

export async function POST(req: NextRequest) {
  let admin;
  try { admin = await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input.');

  const slug = parsed.data.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').slice(0, 60) + `-${Date.now().toString(36)}`;

  const { data, error } = await db.from('products').insert({ ...parsed.data, slug }).select('id, slug, title, status').single();
  if (error) return Errors.internal(error.message);

  await logAudit({ userId: admin.sub, action: 'admin.product.create', entityType: 'product', entityId: data!.id, newData: parsed.data, ipAddress: getClientIp(req.headers) });

  return successResponse(data, undefined, 201);
}

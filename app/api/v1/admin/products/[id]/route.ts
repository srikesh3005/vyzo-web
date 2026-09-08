/**
 * GET    /api/v1/admin/products/[id]  — Get product (admin view with full data)
 * PUT    /api/v1/admin/products/[id]  — Update product
 * DELETE /api/v1/admin/products/[id]  — Archive product
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAdmin, AuthError, logAudit } from '@/lib/utils/auth-server';
import { getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  brand_name: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  price_paise: z.number().int().positive().optional(),
  original_price_paise: z.number().int().positive().optional(),
  amazon_url: z.string().url().optional(),
  affiliate_url: z.string().url().optional(),  // ONLY admin can set this
  category_id: z.string().uuid().optional(),
  subcategory_id: z.string().uuid().optional(),
  commission_rule_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'unpublished', 'archived']).optional(),
  is_trending: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_editors_pick: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  ai_summary: z.string().max(2000).optional(),
  ai_pros: z.array(z.string()).optional(),
  ai_cons: z.array(z.string()).optional(),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  const { data, error } = await db.from('products')
    .select('*, category:categories!products_category_id_fkey(id, slug, name), images:product_images(*), specifications:product_specifications(*)')
    .or(`id.eq.${params.id},slug.eq.${params.id}`)
    .single();

  if (error || !data) return Errors.notFound('Product');
  return successResponse(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let admin;
  try { admin = await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input.');

  // Get old data for audit
  const { data: oldProduct } = await db.from('products').select('*').eq('id', params.id).single();

  const { data, error } = await db.from('products').update(parsed.data).eq('id', params.id)
    .select('id, slug, title, status, is_trending, is_featured, affiliate_url').single();

  if (error || !data) return Errors.notFound('Product');

  await logAudit({ userId: admin.sub, action: 'admin.product.update', entityType: 'product', entityId: params.id, oldData: oldProduct, newData: parsed.data, ipAddress: getClientIp(req.headers) });

  return successResponse(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let admin;
  try { admin = await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  // Soft delete — archive instead of hard delete
  const { data, error } = await db.from('products').update({ status: 'archived' }).eq('id', params.id).select('id, title').single();
  if (error || !data) return Errors.notFound('Product');

  await logAudit({ userId: admin.sub, action: 'admin.product.archive', entityType: 'product', entityId: params.id, ipAddress: getClientIp(req.headers) });

  return successResponse({ archived: true, product_id: data.id });
}

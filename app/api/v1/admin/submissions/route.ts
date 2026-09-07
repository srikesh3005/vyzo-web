/**
 * GET /api/v1/admin/submissions
 * Product submission analytics — what products users are requesting.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAdmin, AuthError } from '@/lib/utils/auth-server';

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch (e) {
    if (e instanceof AuthError) return e.status === 401 ? Errors.unauthorized(e.message) : Errors.forbidden(e.message);
    return Errors.internal();
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const perPage = 50;
  const status = req.nextUrl.searchParams.get('status');
  const offset = (page - 1) * perPage;

  let query = db.from('product_submissions')
    .select('id, amazon_url, asin, status, error_msg, ip_address, created_at, user:users(id, email, full_name), product:products(id, slug, title)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return Errors.internal();

  // Most requested ASINs (group by ASIN)
  const { data: topRequested } = await db.from('product_submissions')
    .select('asin, amazon_url')
    .not('asin', 'is', null)
    .limit(1000);

  const asinCounts: Record<string, { count: number; url: string }> = {};
  for (const sub of topRequested ?? []) {
    if (!sub.asin) continue;
    if (!asinCounts[sub.asin]) asinCounts[sub.asin] = { count: 0, url: sub.amazon_url };
    asinCounts[sub.asin].count++;
  }

  const mostRequested = Object.entries(asinCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([asin, info]) => ({ asin, count: info.count, url: info.url }));

  return successResponse({
    submissions: data ?? [],
    most_requested: mostRequested,
    meta: { total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) },
  });
}

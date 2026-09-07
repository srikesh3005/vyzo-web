/**
 * GET /api/v1/admin/analytics
 * Dashboard analytics summary.
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

  const [
    productsResult,
    usersResult,
    clicksResult,
    submissionsResult,
    topViewedResult,
    topClickedResult,
  ] = await Promise.all([
    db.from('products').select('id, status', { count: 'exact' }),
    db.from('users').select('id', { count: 'exact' }),
    db.from('affiliate_clicks').select('id', { count: 'exact' }),
    db.from('product_submissions').select('id', { count: 'exact' }),
    db.from('products').select('id, slug, title, view_count, affiliate_click_count').eq('status', 'published').order('view_count', { ascending: false }).limit(10),
    db.from('products').select('id, slug, title, affiliate_click_count, view_count').eq('status', 'published').order('affiliate_click_count', { ascending: false }).limit(10),
  ]);

  const productsByStatus = (productsResult.data ?? []).reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return successResponse({
    summary: {
      total_products: productsResult.count ?? 0,
      products_by_status: productsByStatus,
      total_users: usersResult.count ?? 0,
      total_affiliate_clicks: clicksResult.count ?? 0,
      total_submissions: submissionsResult.count ?? 0,
    },
    top_viewed: topViewedResult.data ?? [],
    top_clicked: topClickedResult.data ?? [],
  });
}

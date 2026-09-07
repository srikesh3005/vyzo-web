/**
 * GET  /api/v1/categories       — List all top-level categories
 * GET  /api/v1/categories?tree=1 — Full category tree
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const tree = req.nextUrl.searchParams.get('tree') === '1';

  const { data, error } = await db.from('categories')
    .select('id, slug, name, icon, description, image_url, parent_id, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return Errors.internal();
  const cats = data ?? [];

  if (tree) {
    // Build tree structure
    const top = cats.filter((c: any) => !c.parent_id);
    const result = top.map((parent: any) => ({
      ...parent,
      subcategories: cats.filter((c: any) => c.parent_id === parent.id).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }));
    return successResponse(result);
  }

  return successResponse(cats.filter((c: any) => !c.parent_id));
}

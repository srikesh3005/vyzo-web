/**
 * GET /api/v1/categories/[slug]
 * Category detail + its products
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { data: category, error } = await db.from('categories')
    .select('id, slug, name, icon, description, image_url, parent_id, sort_order')
    .eq('slug', params.slug).eq('is_active', true).single();

  if (error || !category) return Errors.notFound('Category');

  const subcategories = (await db.from('categories').select('id, slug, name, icon, description, sort_order').eq('parent_id', category.id).eq('is_active', true)).data ?? [];

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const perPage = 24;
  const offset = (page - 1) * perPage;

  // Get all category IDs to include (parent + subcategories)
  const categoryIds = [category.id, ...subcategories.map((s: any) => s.id)];

  const { data: products, count } = await db.from('products')
    .select('id, slug, asin, title, brand_name, price_paise, original_price_paise, currency, rating, review_count, availability, estimated_reward_paise, ai_summary, is_trending, is_featured, images:product_images(url, is_primary, sort_order)', { count: 'exact' })
    .eq('status', 'published')
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  return successResponse({
    category: { ...category, subcategories },
    products: {
      items: (products ?? []).map((p: any) => ({
        id: p.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
        price: p.price_paise ? (p.price_paise as number) / 100 : null,
        mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
        currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
        in_stock: p.availability === 'IN_STOCK',
        estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
        ai_summary: p.ai_summary, is_trending: p.is_trending, is_featured: p.is_featured,
        image: (p.images as Array<{ url: string; is_primary: boolean }> | null)?.find((i) => i.is_primary)?.url ?? null,
        images: p.images,
      })),
      total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage),
    },
  });
}

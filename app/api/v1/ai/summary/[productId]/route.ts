/**
 * GET /api/v1/ai/summary/[productId]
 * Trigger or fetch AI summary for a product.
 * GET  → returns existing summary
 * POST → triggers regeneration (admin only)
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { AIProductService } from '@/lib/services/ai-product.service';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAuthFromRequest } from '@/lib/utils/auth-server';

const aiService = new AIProductService();

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const { data: product, error } = await db.from('products')
    .select('id, title, brand_name, description, price_paise, rating, review_count, ai_summary, ai_pros, ai_cons, ai_best_for, ai_who_should_avoid, ai_buying_advice, ai_faqs, ai_recommendation_score, ai_generated_at, category:categories!products_category_id_fkey(name), specifications:product_specifications(name, value)')
    .or(`id.eq.${params.productId},slug.eq.${params.productId}`)
    .eq('status', 'published')
    .single();

  if (error || !product) return Errors.notFound('Product');

  return successResponse({
    product_id: product.id,
    ai_summary: product.ai_summary,
    ai_pros: product.ai_pros ?? [],
    ai_cons: product.ai_cons ?? [],
    ai_best_for: product.ai_best_for ?? [],
    ai_who_should_avoid: product.ai_who_should_avoid ?? [],
    ai_buying_advice: product.ai_buying_advice,
    ai_faqs: product.ai_faqs ?? [],
    ai_recommendation_score: product.ai_recommendation_score,
    ai_generated_at: product.ai_generated_at,
    ai_available: !!product.ai_summary,
  });
}

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== 'admin') return Errors.forbidden();

  if (!aiService.isAvailable) {
    return Errors.badRequest('AI provider is not configured.', 'AI_NOT_CONFIGURED');
  }

  const { data: product, error } = await db.from('products')
    .select('id, title, brand_name, description, price_paise, rating, review_count, category:categories!products_category_id_fkey(name), specifications:product_specifications(name, value)')
    .eq('id', params.productId)
    .single();

  if (error || !product) return Errors.notFound('Product');

  const specs = product.specifications as Array<{ name: string; value: string }> | null;

  const summary = await aiService.generateSummary({
    title: product.title,
    brand: product.brand_name as string | undefined,
    description: product.description as string | undefined,
    price_inr: product.price_paise ? (product.price_paise as number) / 100 : undefined,
    rating: product.rating as number | undefined,
    review_count: product.review_count as number | undefined,
    category: (product.category as { name?: string } | null)?.name,
    specifications: specs ?? [],
  });

  if (!summary) return Errors.internal('AI generation failed. Please try again.');

  await db.from('products').update({
    ai_summary: summary.summary,
    ai_pros: summary.pros,
    ai_cons: summary.cons,
    ai_best_for: summary.best_for,
    ai_who_should_avoid: summary.who_should_avoid,
    ai_buying_advice: summary.buying_advice ?? null,
    ai_faqs: summary.faqs,
    ai_recommendation_score: summary.recommendation_score,
    ai_generated_at: new Date().toISOString(),
    ai_model_version: 'v1',
    seo_title: summary.seo_title ?? null,
    seo_description: summary.seo_description ?? null,
    tags: summary.tags ?? null,
    search_keywords: summary.search_keywords ?? null,
  }).eq('id', product.id);

  return successResponse({ generated: true, product_id: product.id });
}

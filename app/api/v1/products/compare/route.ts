/**
 * POST /api/v1/products/compare
 * Compare 2-4 products side-by-side.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase/admin';
import { FieldPath } from 'firebase-admin/firestore';
import { successResponse, Errors } from '@/lib/utils/response';

const CompareSchema = z.object({
  product_ids: z.array(z.string()).min(2).max(4),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = CompareSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest('Provide 2-4 product IDs to compare.');

  try {
    const productIds = parsed.data.product_ids;

    const snapshot = await db.collection('products')
      .where(FieldPath.documentId(), 'in', productIds)
      .where('status', '==', 'published')
      .get();

    if (snapshot.empty || snapshot.docs.length < 2) {
      return Errors.badRequest('At least 2 valid products required for comparison.');
    }

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record<string, any>));

    // Build comparison table
    const allSpecNames = new Set<string>();
    data.forEach(p => {
      (p.specifications as Array<{ name: string }> | null)?.forEach(s => allSpecNames.add(s.name));
    });

    const comparison = data.map(p => {
      const specs = (p.specifications as Array<{ name: string; value: string }> | null) ?? [];
      const specMap = specs.reduce((acc, s) => ({ ...acc, [s.name]: s.value }), {} as Record<string, string>);

      return {
        id: p.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
        price: p.price_paise ? (p.price_paise as number) / 100 : null,
        mrp: p.original_price_paise ? (p.original_price_paise as number) / 100 : null,
        currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
        in_stock: p.availability === 'IN_STOCK',
        estimated_reward: p.estimated_reward_paise ? (p.estimated_reward_paise as number) / 100 : null,
        ai_summary: p.ai_summary, ai_pros: p.ai_pros ?? [], ai_cons: p.ai_cons ?? [],
        ai_recommendation_score: p.ai_recommendation_score, category: p.category,
        image: (p.images as Array<{ url: string; is_primary: boolean }> | null)?.find((i) => i.is_primary)?.url ?? null,
        specs: specMap,
      };
    });

    return successResponse({ products: comparison, spec_names: Array.from(allSpecNames) });
  } catch (error) {
    console.error('Compare error:', error);
    return Errors.internal();
  }
}

/**
 * GET /api/v1/products/[id]/related
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { successResponse, Errors } from '@/lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') || '4', 10));

  const isASIN = /^[A-Z0-9]{10}$/.test(params.id);
  const isFirestoreId = /^[a-zA-Z0-9]{20}$/.test(params.id);
  
  let productSnap: any = null;
  if (isFirestoreId) {
    productSnap = await db.collection('products').doc(params.id).get();
  }
  if (!productSnap || !productSnap.exists) {
    const query = db.collection('products').where(isASIN ? 'asin' : 'slug', '==', params.id).limit(1);
    const result = await query.get();
    if (!result.empty) productSnap = result.docs[0];
  }

  if (!productSnap || !productSnap.exists) return Errors.notFound('Product');
  const productData = productSnap.data();

  if (!productData?.category_id) return successResponse([]);

  const relatedSnapshot = await db.collection('products')
    .where('status', '==', 'published')
    .where('category_id', '==', productData.category_id)
    .limit(limit + 1)
    .get();

  const related = relatedSnapshot.docs
    .filter(doc => doc.id !== productSnap.id)
    .slice(0, limit)
    .map(doc => {
      const p = doc.data();
      const images = Array.isArray(p.images) ? p.images : [];
      let primaryImage = images.find((i: any) => i.is_primary)?.url;
      if (!primaryImage && images.length > 0) primaryImage = images[0].url;

      return {
        id: doc.id, slug: p.slug, asin: p.asin, name: p.title, brand: p.brand_name,
        price: p.price_paise ? p.price_paise / 100 : null,
        mrp: p.original_price_paise ? p.original_price_paise / 100 : null,
        currency: p.currency || 'INR', rating: p.rating, review_count: p.review_count,
        in_stock: p.availability === 'IN_STOCK',
        estimated_reward: p.estimated_reward_paise ? p.estimated_reward_paise / 100 : null,
        ai_summary: p.ai_summary,
        image: primaryImage,
        images: images,
      };
    });

  return successResponse(related);
}

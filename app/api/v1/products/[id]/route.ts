/**
 * GET /api/v1/products/[id]
 * Full product detail — by ID or slug or ASIN.
 *
 * GET /api/v1/products/trending
 * GET /api/v1/products/featured
 * (handled by separate files due to Next.js routing)
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAuthFromRequest } from '@/lib/utils/auth-server';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`[API] Fetching product details for ID/Slug: ${id}`);
  if (!id) return Errors.badRequest('Product ID or slug is required.');

  // Detect ASIN (10 chars uppercase alphanumeric)
  const isASIN = /^[A-Z0-9]{10}$/.test(id);
  // Detect typical Firestore auto ID (20 chars alphanumeric)
  const isFirestoreId = /^[a-zA-Z0-9]{20}$/.test(id);

  let docSnap = null;

  try {
    if (isFirestoreId) {
      console.log(`[API] Trying Firestore ID lookup for: ${id}`);
      const doc = await db.collection('products').doc(id).get();
      if (doc.exists) {
        docSnap = doc;
        console.log(`[API] Found by Firestore ID: ${docSnap.id}`);
      }
    }

    if (!docSnap) {
      let query: any = db.collection('products');
      if (isASIN) {
        console.log(`[API] Trying ASIN lookup for: ${id}`);
        query = query.where('asin', '==', id);
      } else {
        console.log(`[API] Trying Slug lookup for: ${id}`);
        query = query.where('slug', '==', id);
      }
      
      const snapshot = await query.limit(1).get();
      if (!snapshot.empty) {
        docSnap = snapshot.docs[0];
        console.log(`[API] Found by Query: ${docSnap.id}`);
      } else {
        console.log(`[API] Query returned empty for: ${id}`);
      }
    }
  } catch (error) {
    console.error(`[API] Failed to fetch product ${id}:`, error);
    return Errors.internal('Database error');
  }

  if (!docSnap) {
    console.log(`[API] Returning 404 for: ${id}`);
    return Errors.notFound('Product');
  }

  const rawData = docSnap.data();
  
  // Handle case where category is stored as an object {name, slug, id}
  let categoryName = rawData.category;
  let categorySlug = rawData.category_slug;
  
  if (typeof rawData.category === 'object' && rawData.category !== null) {
    categoryName = rawData.category.name || 'Uncategorized';
    categorySlug = rawData.category.slug || 'uncategorized';
  }

  const productData = { 
    id: docSnap.id, 
    ...rawData,
    category: categoryName || 'Uncategorized',
    category_slug: categorySlug || 'uncategorized'
  };
  console.log(`[API] Success! Returning product details for: ${productData.slug}`);

  // ─── Record view (fire-and-forget) ──────────────────────────────────────────
  const user = await getAuthFromRequest(req);
  recordView(productData.id, user?.sub ?? null).catch(() => {});

  return successResponse(normalizeProductDetail(productData));
}

async function recordView(productId: string, userId: string | null) {
  // Increment view count directly on the product document
  await db.collection('products').doc(productId).update({
    view_count: FieldValue.increment(1)
  }).catch(() => {});

  if (userId) {
    const recentlyViewedId = `${userId}_${productId}`;
    await db.collection('recently_viewed').doc(recentlyViewedId).set({
      user_id: userId,
      product_id: productId,
      viewed_at: new Date().toISOString()
    }, { merge: true }).catch(() => {});
  }
}

function normalizeProductDetail(p: any) {
  const pricePaise = p.price_paise as number | null;
  const originalPricePaise = p.original_price_paise as number | null;
  const commissionPaise = p.estimated_commission_paise as number | null;
  const rewardPaise = p.estimated_reward_paise as number | null;
  
  // Convert embedded specifications array into a record map for the UI
  const specsList = Array.isArray(p.specifications) ? p.specifications : [];
  const specsMap = specsList.reduce((acc: any, s: any) => {
    if (s.name) acc[s.name] = s.value;
    return acc;
  }, {});

  // The primary image is either marked is_primary or it's the first one
  const images = Array.isArray(p.images) ? p.images : [];
  let primaryImage = images.find((i: any) => i.is_primary)?.url;
  if (!primaryImage && images.length > 0) {
    primaryImage = images[0].url;
  }

  return {
    id: p.id,
    slug: p.slug,
    asin: p.asin,
    name: p.title,
    title: p.title,
    brand: p.brand_name || p.brand,
    description: p.description,
    price: pricePaise ? pricePaise / 100 : null,
    mrp: originalPricePaise ? originalPricePaise / 100 : null,
    currency: p.currency || 'INR',
    rating: p.rating,
    review_count: p.review_count,
    availability: p.availability,
    in_stock: p.availability === 'IN_STOCK',
    amazon_url: p.amazon_url,
    // affiliate_url NEVER exposed here — use /buy endpoint
    commission_rate: p.commission_rate,
    estimated_commission: commissionPaise ? commissionPaise / 100 : null,
    estimated_reward: rewardPaise ? rewardPaise / 100 : null,
    estimated_coins: rewardPaise,
    ai_summary: p.ai_summary ? {
      summary: p.ai_summary,
      pros: p.ai_pros || [],
      cons: p.ai_cons || [],
      best_for: p.ai_best_for || [],
      who_should_avoid: p.ai_who_should_avoid || [],
      buying_advice: p.ai_buying_advice,
      faqs: p.ai_faqs || [],
      recommendation_score: p.ai_recommendation_score,
    } : null,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    tags: p.tags ?? [],
    is_trending: p.is_trending,
    is_featured: p.is_featured,
    is_editors_pick: p.is_editors_pick,
    is_best_seller: p.is_best_seller,
    status: p.status,
    category: p.category?.name || p.category_id || p.category, // fallback for different formats
    subcategory: p.subcategory?.name || p.subcategory_id || p.subcategory,
    image: primaryImage, // Add the primary image for the frontend
    images: images,
    specifications: specsList,
    specs: specsMap,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

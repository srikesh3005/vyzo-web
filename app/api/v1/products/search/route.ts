/**
 * GET /api/v1/products/search?q=
 * Full-text product search. Also detects Amazon URLs and redirects to import.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { successResponse, Errors } from '@/lib/utils/response';
import { rateLimit_search, getClientIp } from '@/lib/utils/rate-limit';
import { isAmazonUrl } from '@/lib/amazon/asin';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit_search(ip);
  if (!rl.allowed) return Errors.rateLimited();

  const { searchParams } = req.nextUrl;
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
  const category = searchParams.get('category') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const sort = searchParams.get('sort') || 'relevance';

  if (!q) {
    return Errors.badRequest('Search query is required.', 'MISSING_QUERY');
  }

  // ─── Amazon URL Detection ───────────────────────────────────────────────────
  // Backend validates too — never trust client-only detection
  if (isAmazonUrl(q)) {
    return successResponse(null, {
      redirect_to_import: true,
      message: 'Amazon URL detected. Use POST /api/v1/products/import-url to import this product.',
      url: q,
    });
  }

  const startTime = Date.now();

  try {
    const productsRef = db.collection('products').where('status', '==', 'published');
    const snapshot = await productsRef.get();
    
    let allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record<string, any>));

    // Client-side text matching since Firestore doesn't natively support full-text search
    const queryLower = q.toLowerCase();
    allProducts = allProducts.filter(p => {
      const matchTitle = p.title?.toLowerCase().includes(queryLower);
      const matchBrand = p.brand_name?.toLowerCase().includes(queryLower);
      const matchAsin = p.asin?.toLowerCase().includes(queryLower);
      return matchTitle || matchBrand || matchAsin;
    });

    if (category) {
      const catSnap = await db.collection('categories').where('slug', '==', category).limit(1).get();
      if (!catSnap.empty) {
        const catId = catSnap.docs[0].id;
        allProducts = allProducts.filter(p => p.category_id === catId || p.category?.id === catId || p.category?.slug === category);
      } else {
        allProducts = [];
      }
    }

    if (brand) {
      const brandLower = brand.toLowerCase();
      allProducts = allProducts.filter(p => p.brand_name?.toLowerCase().includes(brandLower));
    }

    // Sorting
    allProducts.sort((a, b) => {
      switch (sort) {
        case 'price_asc': return (a.price_paise || 0) - (b.price_paise || 0);
        case 'price_desc': return (b.price_paise || 0) - (a.price_paise || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': {
          const tA = a.created_at?.toMillis ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
          const tB = b.created_at?.toMillis ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
          return tB - tA;
        }
        case 'trending': return (b.view_count || 0) - (a.view_count || 0);
        default: return 0; // relevance
      }
    });

    const total = allProducts.length;
    const totalPages = Math.ceil(total / perPage);
    const offset = (page - 1) * perPage;
    const paginatedProducts = allProducts.slice(offset, offset + perPage);
    
    const searchTime = Date.now() - startTime;

    return successResponse(
      paginatedProducts.map(normalizeItem),
      {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        query: q,
        search_time_ms: searchTime,
        has_next: page < totalPages,
        has_prev: page > 1,
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return Errors.internal();
  }
}

function normalizeItem(p: Record<string, any>) {
  return {
    id: p.id,
    slug: p.slug,
    asin: p.asin,
    name: p.title,
    brand: p.brand_name,
    price: p.price_paise ? p.price_paise / 100 : null,
    mrp: p.original_price_paise ? p.original_price_paise / 100 : null,
    currency: p.currency || 'INR',
    rating: p.rating,
    review_count: p.review_count,
    in_stock: p.availability === 'IN_STOCK',
    estimated_reward: p.estimated_reward_paise ? p.estimated_reward_paise / 100 : null,
    ai_summary: p.ai_summary,
    is_trending: p.is_trending,
    is_featured: p.is_featured,
    category: p.category,
    image: getPrimaryImage(p.images as Array<{ url: string; is_primary: boolean; sort_order: number }> | null),
    images: p.images,
  };
}

function getPrimaryImage(images: Array<{ url: string; is_primary: boolean; sort_order: number }> | null): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary);
  return primary?.url ?? images[0]?.url ?? null;
}

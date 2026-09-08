/**
 * GET /api/v1/search/autocomplete?q=
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { successResponse } from '@/lib/utils/response';
import { getClientIp, checkRateLimit } from '@/lib/utils/rate-limit';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`autocomplete:ip:${ip}`, 200, 60);
  if (!rl.allowed) {
    return successResponse([]);
  }

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q || q.length < 2) return successResponse([]);

  try {
    // Firebase doesn't support native full-text search, so we use range queries
    // to simulate startsWith behaviour: q <= title < q + '\uf8ff'
    const end = q + '\uf8ff';

    const [productSnap, brandSnap] = await Promise.all([
      db.collection('products')
        .where('status', '==', 'published')
        .where('title', '>=', q)
        .where('title', '<=', end)
        .limit(8)
        .get(),
      db.collection('products')
        .where('status', '==', 'published')
        .where('brand_name', '>=', q)
        .where('brand_name', '<=', end)
        .limit(4)
        .get(),
    ]);

    const productSuggestions = productSnap.docs.map((doc) => {
      const p = doc.data();
      return {
        type: 'product',
        text: p.title,
        slug: p.slug ?? null,
        asin: p.asin ?? null,
        brand: p.brand_name ?? null,
      };
    });

    const seenBrands = new Set<string>();
    const brandSuggestions: any[] = [];
    for (const doc of brandSnap.docs) {
      const brand = doc.data().brand_name;
      if (brand && !seenBrands.has(brand)) {
        seenBrands.add(brand);
        brandSuggestions.push({ type: 'brand', text: brand, slug: null, asin: null, brand: null });
      }
    }

    return successResponse([...productSuggestions, ...brandSuggestions].slice(0, 10));
  } catch (error) {
    // Return empty results gracefully instead of 500
    return successResponse([]);
  }
}

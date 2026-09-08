import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase/admin';
import { getAuthFromRequest } from '@/lib/utils/auth-server';
import { logger } from '@/lib/utils/logger';
import { getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  // Force dynamic rendering bailout immediately
  headers();
  const { productId } = params;

  try {
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return NextResponse.redirect(new URL('/404', req.url));
    }

    const product = productSnap.data();
    const affiliateUrl = product?.affiliate_url || product?.amazon_url;

    if (!affiliateUrl) {
      return NextResponse.redirect(new URL(`/products/${product?.slug || productId}`, req.url));
    }

    // Record click asynchronously
    const user = await getAuthFromRequest(req).catch(() => null);
    const ip = getClientIp(req.headers);
    
    db.collection('affiliate_clicks').add({
      product_id: productId,
      merchant: 'amazon',
      affiliate_url: affiliateUrl,
      user_id: user?.sub ?? null,
      ip_address: ip,
      created_at: new Date().toISOString(),
    }).catch((err: any) => {
      logger.error('Failed to log affiliate click', { error: String(err), productId });
    });

    // Increment click count on product
    productRef.update({
      affiliate_click_count: (product?.affiliate_click_count || 0) + 1,
    }).catch(() => {});

    // Use 302 Found for tracking links to avoid permanent browser caching
    return NextResponse.redirect(affiliateUrl, 302);
  } catch (error) {
    logger.error('Error redirecting to affiliate URL', { error: String(error), productId });
    return NextResponse.redirect(new URL('/', req.url));
  }
}

/**
 * GET /api/v1/products/[id]/buy
 * Returns the affiliate URL server-side.
 * NEVER exposes affiliate secrets or tags to the browser directly.
 * Records the affiliate click before redirecting.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAuthFromRequest } from '@/lib/utils/auth-server';
import { rateLimit_affiliateClick, getClientIp } from '@/lib/utils/rate-limit';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const ip = getClientIp(req.headers);
  const user = await getAuthFromRequest(req);

  const rl = rateLimit_affiliateClick(user?.sub ?? null, ip);
  if (!rl.allowed) return Errors.rateLimited();

  // Fetch product
  // Fallback pattern to check ID, then slug, then asin
  let product: any = null;
  let productId = id;

  const docRef = await db.collection('products').doc(id).get();
  if (docRef.exists) {
    product = { id: docRef.id, ...docRef.data() };
  } else {
    const slugQuery = await db.collection('products').where('slug', '==', id).limit(1).get();
    if (!slugQuery.empty) {
      product = { id: slugQuery.docs[0].id, ...slugQuery.docs[0].data() };
      productId = product.id;
    } else {
      const asinQuery = await db.collection('products').where('asin', '==', id).limit(1).get();
      if (!asinQuery.empty) {
        product = { id: asinQuery.docs[0].id, ...asinQuery.docs[0].data() };
        productId = product.id;
      }
    }
  }

  if (!product || product.status !== 'published') return Errors.notFound('Product');

  // Build destination URL
  // Priority: admin-set affiliate_url > amazon_url with associate tag appended
  let destinationUrl: string;
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG;

  if (product.affiliate_url) {
    destinationUrl = product.affiliate_url;
  } else if (product.amazon_url && associateTag) {
    // Append associate tag to the normalized URL
    const url = new URL(product.amazon_url);
    url.searchParams.set('tag', associateTag);
    destinationUrl = url.toString();
  } else if (product.amazon_url) {
    destinationUrl = product.amazon_url;
  } else {
    return Errors.notFound('Affiliate URL for this product');
  }

  // Record click
  const clickId = `VYZO-CLICK-${uuidv4()}`;
  await db.collection('affiliate_clicks').doc(clickId).set({
    click_id: clickId,
    user_id: user?.sub ?? null,
    product_id: productId,
    merchant_id: 'amazon',
    referrer: req.headers.get('referer') ?? null,
    device: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
    ip_address: ip,
    user_agent: req.headers.get('user-agent') ?? null,
    created_at: FieldValue.serverTimestamp()
  }).catch(() => {}); // non-critical

  // Increment click counter
  await db.collection('products').doc(productId).update({
    affiliate_click_count: FieldValue.increment(1)
  }).catch(() => {});

  // Return JSON with destination (frontend controls redirect)
  return successResponse({
    click_id: clickId,
    destination: destinationUrl,
    product_id: productId,
    product_title: product.title,
  });
}

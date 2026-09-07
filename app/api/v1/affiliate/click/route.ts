/**
 * POST /api/v1/affiliate/click
 * Records an affiliate click and returns the destination URL.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAuthFromRequest } from '@/lib/utils/auth-server';
import { rateLimit_affiliateClick, getClientIp } from '@/lib/utils/rate-limit';
import { v4 as uuidv4 } from 'uuid';

const RequestSchema = z.object({
  product_id: z.string().uuid(),
  campaign: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const user = await getAuthFromRequest(req);

  const rl = rateLimit_affiliateClick(user?.sub ?? null, ip);
  if (!rl.allowed) return Errors.rateLimited();

  let body: unknown;
  try { body = await req.json(); } catch { return Errors.badRequest('Invalid JSON.'); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid request.');

  const { product_id, campaign } = parsed.data;

  // Verify product exists
  const { data: product } = await db.from('products')
    .select('id, amazon_url, affiliate_url, title')
    .eq('id', product_id)
    .eq('status', 'published')
    .single();

  if (!product) return Errors.notFound('Product');

  const clickId = `VYZO-CLICK-${uuidv4()}`;
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG;

  let destinationUrl: string;
  if (product.affiliate_url) {
    destinationUrl = product.affiliate_url;
  } else if (product.amazon_url && associateTag) {
    const url = new URL(product.amazon_url);
    url.searchParams.set('tag', associateTag);
    destinationUrl = url.toString();
  } else {
    destinationUrl = product.amazon_url ?? '';
  }

  await db.from('affiliate_clicks').insert({
    click_id: clickId,
    user_id: user?.sub ?? null,
    product_id,
    merchant_id: 'amazon',
    referrer: req.headers.get('referer') ?? null,
    device: req.headers.get('user-agent')?.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
    campaign: campaign ?? null,
    ip_address: ip,
    user_agent: req.headers.get('user-agent') ?? null,
  });

  await Promise.resolve(db.rpc('increment_product_counter', { p_product_id: product_id, p_column: 'affiliate_click_count' })).catch(() => {});

  return successResponse({ click_id: clickId, destination: destinationUrl, product_id });
}

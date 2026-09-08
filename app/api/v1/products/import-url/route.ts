/**
 * POST /api/v1/products/import-url
 *
 * Core product import flow:
 * 1. Validate URL → Amazon India only
 * 2. Extract ASIN
 * 3. Check for duplicate → return existing if found
 * 4. Fetch from product provider
 * 5. Classify category
 * 6. Calculate commission + reward
 * 7. Store product + images + specs
 * 8. Trigger AI processing (background)
 * 9. Record submission
 * 10. Return product
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isAmazonInUrl, resolveAmazonUrl, generateAmazonAffiliateUrl } from '@/lib/amazon/asin';
import { getProductProvider } from '@/lib/amazon/index';
import type { ProviderProduct } from '@/lib/amazon/types';
import { CommissionService } from '@/lib/services/commission.service';
import { CategoryClassifier } from '@/lib/services/category-classifier';
import { AIProductService } from '@/lib/services/ai-product.service';
import { successResponse, Errors } from '@/lib/utils/response';
import { rateLimit_importUrl, getClientIp } from '@/lib/utils/rate-limit';
import { getAuthFromRequest } from '@/lib/utils/auth-server';
import { generateSlug } from '@/lib/utils/slug';
import { logger, generateRequestId } from '@/lib/utils/logger';

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  url: z.string().url('Please provide a valid URL.').max(2000),
});

const commissionService = new CommissionService();
const categoryClassifier = new CategoryClassifier();
const aiService = new AIProductService();

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const ip = getClientIp(req.headers);
  const user = await getAuthFromRequest(req);

  // ─── Rate Limiting ──────────────────────────────────────────────────────────
  const rateCheck = rateLimit_importUrl(user?.sub ?? null, ip);
  if (!rateCheck.allowed) {
    logger.warn('Rate limit exceeded on import-url', { request_id: requestId, ip, user_id: user?.sub });
    return Errors.rateLimited();
  }

  // ─── Parse + Validate Body ──────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Errors.badRequest('Invalid JSON body.');
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.badRequest(parsed.error.errors[0]?.message ?? 'Invalid request.');
  }

  const { url } = parsed.data;

  // ─── Validate Amazon Domain ─────────────────────────────────────────────────
  if (!isAmazonInUrl(url)) {
    return Errors.invalidAmazonUrl();
  }

  // ─── Extract ASIN ───────────────────────────────────────────────────────────
  const asin = await resolveAmazonUrl(url);
  if (!asin) {
    return Errors.invalidAsin();
  }

  const normalizedUrl = `https://www.amazon.in/dp/${asin}`;

  // ─── Record Submission (always, before any other logic) ────────────────────
  const submissionRef = db.collection('product_submissions').doc();
  const submissionInsertPromise = submissionRef.set({
    user_id: user?.sub ?? null,
    amazon_url: url,
    asin,
    status: 'PROCESSING',
    ip_address: ip,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // ─── Duplicate Detection ────────────────────────────────────────────────────
  const existingProductsSnapshot = await db
    .collection('products')
    .where('asin', '==', asin)
    .limit(1)
    .get();

  let existingProduct: any = null;
  if (!existingProductsSnapshot.empty) {
    existingProduct = {
      id: existingProductsSnapshot.docs[0].id,
      ...existingProductsSnapshot.docs[0].data(),
    };
  }

  // ─── If product exists → update submission + return ─────────────────────────
  if (existingProduct) {
    await submissionInsertPromise;
    await submissionRef.update({
      product_id: existingProduct.id,
      status: 'DUPLICATE',
      updated_at: new Date().toISOString(),
    });

    const generatedAffiliateUrl = generateAmazonAffiliateUrl(asin);

    const updateOps: any = {
      submission_count: FieldValue.increment(1)
    };

    // Regenerate affiliate url if missing or incorrect
    if (existingProduct.affiliate_url !== generatedAffiliateUrl) {
      updateOps.affiliate_url = generatedAffiliateUrl;
      existingProduct.affiliate_url = generatedAffiliateUrl;
    }

    // Increment submission count and update affiliate_url
    await db.collection('products').doc(existingProduct.id).update(updateOps).catch(() => {});

    logger.info('Product import: duplicate found', {
      request_id: requestId,
      asin,
      product_id: existingProduct.id,
    });

    return successResponse(normalizeProductResponse(existingProduct), {
      source: 'amazon',
      asin,
      canonical_url: normalizedUrl,
      affiliate_url: generatedAffiliateUrl,
      existing: true,
      commission_category: existingProduct.commission_rule_name,
    });
  }

  // ─── Fetch from Product Provider ────────────────────────────────────────────
  const provider = getProductProvider('amazon');
  let providerProduct;
  try {
    providerProduct = await provider.fetchProduct(asin);
  } catch (err) {
    logger.error('Product provider failed', { request_id: requestId, asin, error: String(err) });
    await submissionInsertPromise;
    await submissionRef.update({ status: 'FAILED', error_msg: String(err), updated_at: new Date().toISOString() });
    return Errors.internal('Failed to fetch product information. Please try again.');
  }

  if (!providerProduct) {
    await submissionInsertPromise;
    await submissionRef.update({ status: 'REJECTED', error_msg: 'Product not found on Amazon', updated_at: new Date().toISOString() });
    return Errors.notFound('Product');
  }

  // ─── Brand Resolution ───────────────────────────────────────────────────────
  let brandId: string | null = null;
  if (providerProduct.brand) {
    const brandSlug = providerProduct.brand.toLowerCase().replace(/\s+/g, '-');
    const brandRef = db.collection('brands').doc(brandSlug);
    const brandDoc = await brandRef.get();
    if (!brandDoc.exists) {
      await brandRef.set({ slug: brandSlug, name: providerProduct.brand, created_at: new Date().toISOString() });
    }
    brandId = brandSlug;
  }

  // ─── Category Classification ────────────────────────────────────────────────
  const classification = await categoryClassifier.classify({
    title: providerProduct.title,
    brand: providerProduct.brand,
    description: providerProduct.description,
    category_hint: providerProduct.category_hint,
  });

  // ─── Commission Calculation ─────────────────────────────────────────────────
  const commission = await commissionService.calculate(
    providerProduct.price_paise ?? 0,
    classification.category_id
  );

  // ─── Generate Slug ──────────────────────────────────────────────────────────
  const slug = generateSlug(providerProduct.title, asin);

  // ─── Prepare Images & Specs (Embedded) ──────────────────────────────────────
  const images = providerProduct.images.map((img) => ({
    url: img.url,
    thumbnail_url: img.thumbnail_url ?? null,
    is_primary: img.is_primary,
    sort_order: img.sort_order,
  }));

  const specifications = providerProduct.specifications.map((spec) => ({
    group_name: spec.group_name ?? null,
    name: spec.name,
    value: spec.value,
    sort_order: spec.sort_order,
  }));

  // ─── Store Product ──────────────────────────────────────────────────────────
  let newProductId: string;
  let newProductData: any;

  try {
    const productRef = db.collection('products').doc();
    newProductId = productRef.id;
    newProductData = {
      id: newProductId,
      asin,
      merchant: 'amazon',
      slug,
      title: providerProduct.title,
      brand_id: brandId,
      brand_name: providerProduct.brand ?? null,
      category_id: classification.category_id,
      subcategory_id: classification.subcategory_id,
      category: {
        id: classification.category_id,
        slug: classification.category_id,
        name: classification.category_name,
      },
      description: providerProduct.description ?? null,
      model_number: providerProduct.model_number ?? null,
      price_paise: providerProduct.price_paise ?? null,
      original_price_paise: providerProduct.original_price_paise ?? null,
      currency: providerProduct.currency,
      rating: providerProduct.rating ?? null,
      review_count: providerProduct.review_count ?? null,
      availability: providerProduct.availability,
      amazon_url: normalizedUrl,
      affiliate_url: generateAmazonAffiliateUrl(asin),
      commission_rule_id: commission.commission_rule_id,
      commission_rate: commission.commission_rate,
      estimated_commission_paise: commission.estimated_commission_paise,
      estimated_reward_paise: commission.estimated_reward_paise,
      status: 'published',
      submission_count: 1,
      images,
      specifications,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await db.runTransaction(async (t) => {
      const existingQuery = await t.get(db.collection('products').where('asin', '==', asin).limit(1));
      if (!existingQuery.empty) {
        throw new Error('DUPLICATE_ASIN');
      }
      t.set(productRef, newProductData);
    });

  } catch (error: any) {
    if (error.message === 'DUPLICATE_ASIN') {
      const existingQuery = await db.collection('products').where('asin', '==', asin).limit(1).get();
      const raceWinner = { id: existingQuery.docs[0].id, ...existingQuery.docs[0].data() };
      return successResponse(normalizeProductResponse(raceWinner), { source: 'amazon', asin, canonical_url: normalizedUrl, affiliate_url: generateAmazonAffiliateUrl(asin), existing: true });
    }
    logger.error('Failed to insert product', { request_id: requestId, asin, error: error?.message });
    return Errors.internal('Failed to store product. Please try again.');
  }

  // ─── Update Submission ──────────────────────────────────────────────────────
  await submissionInsertPromise;
  await submissionRef.update({
    product_id: newProductId,
    status: 'COMPLETED',
    updated_at: new Date().toISOString(),
  });

  // ─── AI Processing (fire-and-forget, non-blocking) ─────────────────────────
  if (aiService.isAvailable) {
    generateAISummaryBackground(newProductId, providerProduct, classification.category_name).catch(
      (err) => logger.error('AI background job failed', { product_id: newProductId, error: String(err) })
    );
  }

  logger.info('Product import: success', {
    request_id: requestId,
    asin,
    product_id: newProductId,
    duration_ms: Date.now() - startTime,
  });

  return successResponse(normalizeProductResponse(newProductData), {
    source: 'amazon',
    asin,
    canonical_url: normalizedUrl,
    affiliate_url: newProductData.affiliate_url,
    existing: false,
    commission_category: commission.commission_rule_name,
    classification_confidence: classification.confidence,
  }, 201);
}

// ─── Background AI Generation ─────────────────────────────────────────────────

async function generateAISummaryBackground(
  productId: string,
  providerProduct: ProviderProduct,
  categoryName: string | null
): Promise<void> {
  const summary = await aiService.generateSummary({
    title: providerProduct.title,
    brand: providerProduct.brand,
    description: providerProduct.description,
    price_inr: providerProduct.price_paise ? providerProduct.price_paise / 100 : undefined,
    rating: providerProduct.rating,
    review_count: providerProduct.review_count,
    category: categoryName ?? undefined,
    specifications: providerProduct.specifications.map((s) => ({ name: s.name, value: s.value })),
  });

  if (!summary) return;

  await db.collection('products').doc(productId).update({
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
    updated_at: new Date().toISOString(),
  });
}

// ─── Response Normalizer ──────────────────────────────────────────────────────

function normalizeProductResponse(product: any) {
  if (!product) return null;
  const pricePaise = product.price_paise as number | null;
  const originalPricePaise = product.original_price_paise as number | null;
  const commissionPaise = product.estimated_commission_paise as number | null;
  const rewardPaise = product.estimated_reward_paise as number | null;

  return {
    id: product.id,
    slug: product.slug,
    asin: product.asin,
    title: product.title,
    name: product.title, // alias for frontend compat
    brand: product.brand_name,
    description: product.description,
    price: pricePaise ? pricePaise / 100 : null,
    mrp: originalPricePaise ? originalPricePaise / 100 : null,
    currency: product.currency || 'INR',
    rating: product.rating,
    review_count: product.review_count,
    availability: product.availability,
    in_stock: product.availability === 'IN_STOCK',
    amazon_url: product.amazon_url,
    commission_rate: product.commission_rate,
    estimated_commission: commissionPaise ? commissionPaise / 100 : null,
    estimated_reward: rewardPaise ? rewardPaise / 100 : null,
    estimated_coins: rewardPaise, // 1 coin = ₹0.01 = 1 paise
    ai_summary: product.ai_summary,
    ai_pros: product.ai_pros,
    ai_cons: product.ai_cons,
    ai_best_for: product.ai_best_for,
    ai_recommendation_score: product.ai_recommendation_score,
    status: product.status,
    is_trending: product.is_trending,
    is_featured: product.is_featured,
    category: product.category,
    images: product.images,
    specifications: product.specifications,
    specs: buildSpecsRecord(product.specifications),
  };
}

function buildSpecsRecord(specs: Array<{ name: string; value: string }> | null): Record<string, string> {
  if (!specs) return {};
  return specs.reduce((acc, s) => ({ ...acc, [s.name]: s.value }), {} as Record<string, string>);
}

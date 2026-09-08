/**
 * POST /api/v1/products/[id]/view
 * Record a product view (fire-and-forget from frontend)
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { successResponse } from '@/lib/utils/response';
import { getAuthFromRequest } from '@/lib/utils/auth-server';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthFromRequest(req);
  const { id } = params;

  // Increment view count
  await db.collection('products').doc(id).update({
    view_count: FieldValue.increment(1)
  }).catch(() => {});

  if (user?.sub) {
    // Upsert recently viewed
    await db.collection('recently_viewed').doc(`${user.sub}_${id}`).set({
      user_id: user.sub,
      product_id: id,
      viewed_at: new Date().toISOString()
    }, { merge: true }).catch(() => {});
    
    // Note: In Supabase we used an RPC to trim recently viewed to 100 items per user.
    // In Firestore, this requires querying and deleting older documents,
    // which is best handled via a background Cloud Function.
  }

  return successResponse({ recorded: true });
}

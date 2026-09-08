/**
 * GET /api/v1/search/trending
 * Returns hardcoded trending search terms (can be migrated to Firestore later).
 */
import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';

export const dynamic = "force-dynamic";

const TRENDING_SEARCHES = [
  { query: 'iPhone 15', count: 1200, trend: 'up' },
  { query: 'Samsung Galaxy', count: 980, trend: 'up' },
  { query: 'Laptop under 50000', count: 870, trend: 'stable' },
  { query: 'Noise Cancelling Headphones', count: 760, trend: 'up' },
  { query: 'Smart Watch', count: 650, trend: 'stable' },
  { query: 'Bluetooth Speaker', count: 540, trend: 'down' },
  { query: 'Gaming Chair', count: 430, trend: 'up' },
  { query: 'Air Fryer', count: 390, trend: 'stable' },
  { query: 'Mechanical Keyboard', count: 320, trend: 'up' },
  { query: 'Monitor 4K', count: 290, trend: 'stable' },
];

export async function GET(req: NextRequest) {
  const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') || '6', 10));
  return successResponse(TRENDING_SEARCHES.slice(0, limit));
}

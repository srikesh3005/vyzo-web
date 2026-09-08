/**
 * GET /api/health
 * Docker health check + system status endpoint.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const start = Date.now();

  // Quick DB connectivity check
  let dbStatus: 'ok' | 'error' = 'ok';
  try {
    await db.from('categories').select('id').limit(1);
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'ok' ? 'healthy' : 'degraded';
  const httpStatus = dbStatus === 'ok' ? 200 : 503;

  return Response.json({
    status,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: dbStatus,
      ai_provider: process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'none',
      amazon_provider: process.env.AMAZON_USE_MOCK === 'true' ? 'mock' : process.env.AMAZON_ACCESS_KEY ? 'paapi' : 'mock',
    },
    latency_ms: Date.now() - start,
    timestamp: new Date().toISOString(),
  }, { status: httpStatus });
}

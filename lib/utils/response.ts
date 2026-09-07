/**
 * Vyzo — API Response Helpers
 * Consistent response shape across all API routes.
 */

import { NextResponse } from 'next/server';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(data: T, meta?: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) } satisfies ApiSuccess<T>, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  const body: ApiError = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  return NextResponse.json(body, { status });
}

// ─── Common Error Responses ───────────────────────────────────────────────────

export const Errors = {
  badRequest: (message: string, code = 'BAD_REQUEST') =>
    errorResponse(code, message, 400),

  unauthorized: (message = 'Authentication required.') =>
    errorResponse('UNAUTHORIZED', message, 401),

  forbidden: (message = 'You do not have permission to perform this action.') =>
    errorResponse('FORBIDDEN', message, 403),

  notFound: (resource = 'Resource') =>
    errorResponse('NOT_FOUND', `${resource} not found.`, 404),

  conflict: (message: string) =>
    errorResponse('CONFLICT', message, 409),

  rateLimited: () =>
    errorResponse('RATE_LIMITED', 'Too many requests. Please try again later.', 429),

  internal: (message = 'An unexpected error occurred. Please try again.') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  invalidAmazonUrl: () =>
    errorResponse(
      'INVALID_AMAZON_URL',
      'Please provide a valid Amazon India product URL (amazon.in).',
      400
    ),

  invalidAsin: () =>
    errorResponse('INVALID_ASIN', 'Could not extract a valid ASIN from the provided URL.', 400),
} as const;

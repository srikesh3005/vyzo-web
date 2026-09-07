/**
 * Vyzo — Server-side Authentication
 * JWT verification for API routes.
 * Uses `jose` for edge-compatible JWT operations.
 */

import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vyzo-dev-secret-change-in-production'
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'vyzo-dev-refresh-secret-change-in-production'
);
const JWT_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface JWTPayload {
  sub: string;          // user ID
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

// ─── Token Generation ─────────────────────────────────────────────────────────

export async function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_REFRESH_SECRET);
}

// ─── Token Verification ───────────────────────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as { sub: string };
  } catch {
    return null;
  }
}

// ─── Request Auth Extraction ──────────────────────────────────────────────────

/**
 * Extract and verify the access token from a request.
 * Checks Authorization header and vyzo_access_token cookie.
 * Returns null if no valid token found.
 */
export async function getAuthFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  // Try Authorization header first
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyAccessToken(token);
  }

  // Try cookie
  const cookieToken = req.cookies.get('vyzo_access_token')?.value;
  if (cookieToken) {
    return verifyAccessToken(cookieToken);
  }

  return null;
}

/**
 * Require authentication — returns user payload or throws.
 * Use in protected API routes.
 */
export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthFromRequest(req);
  if (!user) {
    throw new AuthError('UNAUTHORIZED', 'Authentication required.', 401);
  }
  return user;
}

/**
 * Require admin role.
 */
export async function requireAdmin(req: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(req);
  if (user.role !== 'admin') {
    throw new AuthError('FORBIDDEN', 'Admin access required.', 403);
  }
  return user;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ─── Password Hashing ─────────────────────────────────────────────────────────
// Note: bcrypt is not edge-compatible. We use it only in Node.js API routes.

import crypto from 'crypto';

function hashWithPbkdf2(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('hex'));
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await hashWithPbkdf2(password, salt);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hash = await hashWithPbkdf2(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

// ─── Audit Logging ─────────────────────────────────────────────────────────────

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  oldData,
  newData,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await db.from('audit_logs').insert({
      user_id: userId ?? null,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      old_data: oldData ?? null,
      new_data: newData ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('[AuditLog] Failed to write audit log:', err);
  }
}

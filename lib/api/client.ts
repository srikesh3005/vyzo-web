/**
 * Vyzo API Client
 * Central HTTP client with auth token injection, error normalization,
 * and retry logic. Switch between mock (static data) and real API
 * by setting API_URL in .env.local
 */

// When API_URL is empty/not set, use relative path
// for the rewrite in next.config.js (or fallback to production)
// Set API_URL=https://api.vyzo.in/api/v1 in production
const BASE_URL = (() => {
  const env = process.env.API_URL;
  if (env) return env.replace(/\/$/, '');
  // In browser: use relative path
  if (typeof window !== 'undefined') return '/api/v1';
  // In server-side rendering: use absolute localhost path
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}/api/v1`;
})();

// ─── Custom Error Class ──────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Auth Token Management ───────────────────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('vyzo_access_token', token);
    } else {
      localStorage.removeItem('vyzo_access_token');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vyzo_access_token');
  }
  return null;
}

// ─── Core Request Function ───────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  retry?: number;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, retry = 1, ...init } = options;

  // Build URL with query params
  let url: URL;
  if (BASE_URL.startsWith('http')) {
    url = new URL(`${BASE_URL}${path}`);
  } else if (typeof window !== 'undefined') {
    url = new URL(`${BASE_URL}${path}`, window.location.origin);
  } else {
    // Fallback for SSR if BASE_URL is somehow relative (shouldn't happen with current logic)
    url = new URL(`${BASE_URL}${path}`, 'http://localhost:3000');
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        ...init,
        headers,
        next: { revalidate: 60 }, // ISR default
      });

      // Handle 401 — clear token and let app handle redirect
      if (res.status === 401) {
        setAccessToken(null);
        throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please sign in again.');
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Support both old shape (body.code) and new shape (body.error.code)
        const code = body?.error?.code || body.code || 'API_ERROR';
        const message = body?.error?.message || body.detail || body.message || `Request failed with status ${res.status}`;
        throw new ApiError(res.status, code, message);
      }

      // Unwrap our standard { success: true, data: ... } envelope
      const json = await res.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      // 204 No Content handled — json will be null, return as-is
      return json as T;
    } catch (err) {
      lastError = err as Error;
      // Only retry on network errors, not API errors
      if (err instanceof ApiError || attempt === retry) throw err;
      // Exponential backoff: 200ms, 400ms
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }

  throw lastError;
}

// ─── Convenience Methods ─────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: RequestOptions['params']) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

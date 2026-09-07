/**
 * Auth API
 * Authentication-related API calls: login, register, refresh, logout
 */

import { api, setAccessToken } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  username?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Login with email + password */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', payload);
  setAccessToken(res.tokens.access_token);
  if (payload.remember_me && typeof window !== 'undefined') {
    localStorage.setItem('vyzo_refresh_token', res.tokens.refresh_token);
  }
  return res;
}

/** Register a new user */
export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  setAccessToken(res.tokens.access_token);
  return res;
}

/** Refresh access token using stored refresh token */
export async function refreshAccessToken(): Promise<AuthResponse | null> {
  try {
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('vyzo_refresh_token')
        : null;

    if (!refreshToken) return null;

    const res = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    setAccessToken(res.tokens.access_token);
    return res;
  } catch {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vyzo_refresh_token');
    }
    return null;
  }
}

/** Logout — invalidate refresh token on server */
export async function logout(): Promise<void> {
  try {
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('vyzo_refresh_token')
        : null;
    if (refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    }
  } finally {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vyzo_refresh_token');
    }
  }
}

/** Send password reset email */
export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

/** Reset password with token */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await api.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
}

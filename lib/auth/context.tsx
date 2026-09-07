'use client';

/**
 * Vyzo Auth Context
 * Global authentication state management.
 * Wraps the entire app to provide user + auth actions everywhere.
 */

import * as React from 'react';
import { login, register, logout, refreshAccessToken } from '@/lib/api/auth';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/lib/api/auth';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = React.createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Attempt to restore session on mount
  const refreshUser = React.useCallback(async () => {
    try {
      const result = await refreshAccessToken();
      if (result?.user) {
        setUser(result.user);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogin = React.useCallback(
    async (payload: LoginPayload): Promise<AuthUser> => {
      const result = await login(payload);
      setUser(result.user);
      return result.user;
    },
    []
  );

  const handleRegister = React.useCallback(
    async (payload: RegisterPayload): Promise<AuthUser> => {
      const result = await register(payload);
      setUser(result.user);
      return result.user;
    },
    []
  );

  const handleLogout = React.useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
    }),
    [user, isLoading, handleLogin, handleRegister, handleLogout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

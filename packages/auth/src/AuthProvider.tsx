'use client';

import React from 'react';
import type { NexUser, AuthSession, LoginCredentials, AuthError, Permission } from './types';
import {
  saveSession, clearSession, getSession, getCurrentUser,
  isAuthenticated, hasPermission, hasAppAccess, watchSessionExpiry,
} from './session';

// ── Context ───────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: NexUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAccess: (appName: string) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
  onSessionExpired?: () => void;
  onLoginSuccess?: (user: NexUser) => void;
}

export function AuthProvider({
  children,
  apiBaseUrl = 'http://localhost:8080/api/v1',
  onSessionExpired,
  onLoginSuccess,
}: AuthProviderProps) {
  const [user, setUser] = React.useState<NexUser | null>(() => getCurrentUser());
  const [session, setSession] = React.useState<AuthSession | null>(() => getSession());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError | null>(null);

  // Watch for session expiry
  React.useEffect(() => {
    const cleanup = watchSessionExpiry(() => {
      setUser(null);
      setSession(null);
      onSessionExpired?.();
    });
    return cleanup;
  }, [session?.expiresAt]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const authError: AuthError = {
          code: res.status === 401 ? 'INVALID_CREDENTIALS' : 'UNKNOWN',
          message: body.message ?? 'เข้าสู่ระบบไม่สำเร็จ',
        };
        setError(authError);
        return false;
      }

      const data = await res.json();
      // Expected: { user, accessToken, refreshToken?, expiresIn? }
      const newSession: AuthSession = {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresIn
          ? Date.now() + data.expiresIn * 1000
          : Date.now() + 8 * 60 * 60 * 1000, // default 8h
      };

      saveSession(newSession);
      setSession(newSession);
      setUser(newSession.user);
      onLoginSuccess?.(newSession.user);
      return true;
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setSession(null);
    setError(null);
  };

  const can = (permission: Permission) => hasPermission(permission);
  const canAccess = (appName: string) => hasAppAccess(appName);

  return (
    <AuthContext.Provider value={{
      user, session, loading, error,
      isLoggedIn: isAuthenticated(),
      login, logout, can, canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ── HOC: withAuth ─────────────────────────────────────────────────────────────
export interface WithAuthOptions {
  requiredPermission?: Permission;
  requiredApp?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  const { requiredPermission, requiredApp, redirectTo = '/login', fallback = null } = options;

  function ProtectedComponent(props: P) {
    const { isLoggedIn, can, canAccess, loading } = useAuth();

    if (loading) return null;
    if (!isLoggedIn) {
      if (typeof window !== 'undefined') window.location.href = redirectTo;
      return fallback as React.ReactElement;
    }
    if (requiredPermission && !can(requiredPermission)) return fallback as React.ReactElement;
    if (requiredApp && !canAccess(requiredApp)) return fallback as React.ReactElement;

    return <Component {...props} />;
  }

  ProtectedComponent.displayName = `withAuth(${Component.displayName ?? Component.name})`;
  return ProtectedComponent;
}

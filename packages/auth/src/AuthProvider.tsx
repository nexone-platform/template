'use client';

import React from 'react';
import type { NexUser, LoginCredentials, AuthError, Permission, SessionInfo } from './types';
import { setCachedUser, getCachedUser, clearSession, hasPermission, hasAppAccess } from './session';

// ── Context ───────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: NexUser | null;
  loading: boolean;
  error: AuthError | null;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  can: (permission: Permission) => boolean;
  canAccess: (appName: string) => boolean;
  getSessions: () => Promise<SessionInfo[]>;
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
  apiBaseUrl = 'http://localhost:8001/api',
  onSessionExpired,
  onLoginSuccess,
}: AuthProviderProps) {
  const [user, setUser] = React.useState<NexUser | null>(null);
  const [loading, setLoading] = React.useState(true); // Start true — we check session on mount
  const [error, setError] = React.useState<AuthError | null>(null);

  // On mount: check if we have a valid session (cookie is sent automatically)
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          const nexUser: NexUser = {
            userId: userData.userId,
            email: userData.email,
            displayName: userData.displayName,
            roleId: userData.roleId,
            roleName: userData.roleName,
            isActive: userData.isActive,
            employeeId: userData.employeeId,
            avatarUrl: userData.avatarUrl,
            appAccess: userData.appAccess || [],
            lastLoginAt: userData.lastLoginAt,
          };
          setUser(nexUser);
          setCachedUser(nexUser);
        } else {
          // No valid session
          setUser(null);
          setCachedUser(null);
        }
      } catch {
        // Network error — assume not logged in
        setUser(null);
        setCachedUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [apiBaseUrl]);

  // ── Login ───────────────────────────────────────────────────────────
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send & receive cookies
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
      const nexUser: NexUser = data.user;
      setUser(nexUser);
      setCachedUser(nexUser);
      onLoginSuccess?.(nexUser);
      return true;
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore */ }
    setUser(null);
    setCachedUser(null);
    clearSession();
    setError(null);
  };

  // ── Logout All Devices ──────────────────────────────────────────────
  const logoutAll = async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore */ }
    setUser(null);
    setCachedUser(null);
    clearSession();
    setError(null);
  };

  // ── Get Sessions ────────────────────────────────────────────────────
  const getSessions = async (): Promise<SessionInfo[]> => {
    try {
      const res = await fetch(`${apiBaseUrl}/auth/sessions`, { credentials: 'include' });
      if (res.ok) return res.json();
    } catch { /* ignore */ }
    return [];
  };

  const can = (permission: Permission) => hasPermission(permission);
  const canAccess = (appName: string) => hasAppAccess(appName);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      isLoggedIn: user !== null,
      login, logout, logoutAll, can, canAccess, getSessions,
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
  const { requiredPermission, requiredApp, fallback = null } = options;

  function ProtectedComponent(props: P) {
    const { isLoggedIn, can, canAccess, loading } = useAuth();

    if (loading) return null;
    if (!isLoggedIn) return fallback as React.ReactElement;
    if (requiredPermission && !can(requiredPermission)) return fallback as React.ReactElement;
    if (requiredApp && !canAccess(requiredApp)) return fallback as React.ReactElement;

    return <Component {...props} />;
  }

  ProtectedComponent.displayName = `withAuth(${Component.displayName ?? Component.name})`;
  return ProtectedComponent;
}

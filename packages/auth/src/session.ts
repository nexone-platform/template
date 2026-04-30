import type { AuthSession, NexUser, Permission } from './types';

const SESSION_KEY = 'nexone_session';
const TOKEN_KEY   = 'nexone_token';

// ── Token Storage ─────────────────────────────────────────────────────────────
export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, session.accessToken);
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Auto-clear if expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getCurrentUser(): NexUser | null {
  return getSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// ── Permission Helpers ─────────────────────────────────────────────────────────
export function hasPermission(permission: Permission): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.permissions?.includes(permission) ?? false;
}

export function hasAppAccess(appName: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.appAccess?.includes(appName) ?? false;
}

export function hasRole(roleId: number): boolean {
  const user = getCurrentUser();
  return user?.roleId === roleId;
}

// ── Session Expiry Watcher ────────────────────────────────────────────────────
let expiryTimer: ReturnType<typeof setTimeout> | null = null;

export function watchSessionExpiry(onExpired: () => void): () => void {
  const session = getSession();
  if (!session) return () => {};

  const msLeft = session.expiresAt - Date.now();
  if (msLeft <= 0) {
    onExpired();
    return () => {};
  }

  expiryTimer = setTimeout(() => {
    clearSession();
    onExpired();
  }, msLeft);

  return () => {
    if (expiryTimer) clearTimeout(expiryTimer);
  };
}

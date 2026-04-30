import type { NexUser, Permission } from './types';

// ── Session State (in-memory only, no localStorage) ───────────────────────────
// With HttpOnly cookies, the browser manages the session cookie automatically.
// We only store the user object in memory for the current tab.

let cachedUser: NexUser | null = null;

export function setCachedUser(user: NexUser | null): void {
  cachedUser = user;
}

export function getCachedUser(): NexUser | null {
  return cachedUser;
}

export function isAuthenticated(): boolean {
  return cachedUser !== null;
}

export function clearSession(): void {
  cachedUser = null;
}

// ── Permission Helpers ─────────────────────────────────────────────────────────
export function hasPermission(permission: Permission): boolean {
  if (!cachedUser) return false;
  return cachedUser.permissions?.includes(permission) ?? false;
}

export function hasAppAccess(appName: string): boolean {
  if (!cachedUser) return false;
  return cachedUser.appAccess?.includes(appName) ?? false;
}

export function hasRole(roleId: number): boolean {
  return cachedUser?.roleId === roleId;
}

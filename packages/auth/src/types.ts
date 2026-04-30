// ── NexOne Auth Types ──────────────────────────────────────────────────────────

export interface NexUser {
  userId: number;
  employeeId?: string;
  email: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  permissions?: string[];  // e.g. ['nexspeed:read', 'nexspeed:write']
  appAccess?: string[];    // e.g. ['nexspeed', 'nexsite', 'nexforce']
}

export interface AuthSession {
  user: NexUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;  // unix timestamp ms
}

export interface LoginCredentials {
  email: string;
  password: string;
  appName?: string;  // which app is requesting login
}

export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE' | 'TOKEN_EXPIRED' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
}

// ── Permission System ──────────────────────────────────────────────────────────
export type AppName =
  | 'nexspeed' | 'nexsite' | 'nexforce' | 'nexstock' | 'nexfinance'
  | 'nexsales' | 'nexprocure' | 'nexproduce' | 'nexbi' | 'nexless'
  | 'nexcost' | 'nex-core';

export type PermissionAction = 'read' | 'write' | 'delete' | 'export' | 'approve';

export type Permission = `${AppName}:${PermissionAction}`;

// ── Role Definitions ───────────────────────────────────────────────────────────
export interface RoleDefinition {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

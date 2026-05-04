// ── NexOne Auth Types ──────────────────────────────────────────────────────────

export interface NexUser {
  userId: number | string;
  employeeId?: string;
  email: string;
  displayName?: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  avatarUrl?: string;
  permissions?: string[];  // e.g. ['nexspeed:read', 'nexspeed:write']
  appAccess?: string[];    // e.g. ['nexspeed', 'nexsite', 'nexforce']
  lastLoginAt?: string;
}

export interface AuthSession {
  user: NexUser;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  workspaceId: string;
  email: string;
  password: string;
  appName?: string;  // which app is requesting login
}

export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE' | 'SESSION_EXPIRED' | 'NETWORK_ERROR' | 'UNKNOWN';
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

// ── Session Info ───────────────────────────────────────────────────────────────
export interface SessionInfo {
  id: string;
  ipAddress: string;
  deviceName: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

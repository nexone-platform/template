'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@nexone/auth';

// ---------- Types ----------

export interface MenuPermission {
  menuId: number;
  menuCode: string;
  title: string;
  parentId: number | null;
  isActive: boolean;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;
}

interface PermissionContextValue {
  roleId: string | number;
  appName: string;
  permissions: MenuPermission[];
  loading: boolean;
  setRoleId: (id: string | number) => void;
  setAppName: (name: string) => void;
  /** ค้นหา permission ของ menu ใดก็ได้จาก menuCode หรือ title (case-insensitive) */
  getPermission: (menuCode: string) => MenuPermission | null;
  /** ถ้าหา permission ไม่เจอ ให้ default เป็น allow ทั้งหมด (ป้องกัน page โล่ง) */
  getPermissionOrAllow: (menuCode: string) => MenuPermission;
  /** สั่ง re-fetch permissions จาก API ทันที */
  refreshPermissions: () => void;
}

const ALL_ALLOW: Omit<MenuPermission, 'menuId' | 'menuCode' | 'title' | 'parentId'> = {
  isActive: true,
  canView: true,
  canAdd: true,
  canEdit: true,
  canDelete: true,
  canImport: true,
  canExport: true,
};

const PermissionContext = createContext<PermissionContextValue>({
  roleId: '',
  appName: 'nex-core',
  permissions: [],
  loading: false,
  setRoleId: () => {},
  setAppName: () => {},
  getPermission: () => null,
  getPermissionOrAllow: () => ({ menuId: 0, menuCode: '', title: '', parentId: null, ...ALL_ALLOW }),
  refreshPermissions: () => {},
});

// ---------- Flatten tree → flat list ----------

function flatten(nodes: any[]): MenuPermission[] {
  const result: MenuPermission[] = [];
  const walk = (list: any[]) => {
    for (const n of list) {
      result.push({
        menuId: n.menuId,
        menuCode: n.menuCode || '',
        title: n.title || '',
        parentId: n.parentId ?? null,
        isActive: n.isActive ?? false,
        canView: n.canView ?? false,
        canAdd: n.canAdd ?? false,
        canEdit: n.canEdit ?? false,
        canDelete: n.canDelete ?? false,
        canImport: n.canImport ?? false,
        canExport: n.canExport ?? false,
      });
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return result;
}

// ---------- Provider ----------

export function PermissionProvider({ children, initialRoleId = '', initialApp = 'nex-core' }: {
  children: ReactNode;
  initialRoleId?: string | number;
  initialApp?: string;
}) {
  const { user, isLoggedIn } = useAuth();
  
  const [roleId, setRoleId] = useState<string | number>(initialRoleId);
  const [appName, setAppName] = useState(initialApp);
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.roleId || (user as any)?.role_id) {
      setRoleId(user.roleId || (user as any)?.role_id);
    }
  }, [user]);

  const API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api';

  const fetchPermissions = useCallback(async () => {
    if (!roleId || String(roleId).length < 10) return; // Skip if no valid UUID roleId
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/roles/${roleId}/permissions?app=${appName}`);
      if (res.ok) {
        const tree = await res.json();
        setPermissions(flatten(Array.isArray(tree) ? tree : []));
      }
    } catch (e) {
      console.warn('[PermissionContext] fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [roleId, appName, API]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const getPermission = useCallback((menuCode: string): MenuPermission | null => {
    const code = menuCode.toLowerCase();
    return permissions.find(
      p => p.menuCode?.toLowerCase() === code || p.title?.toLowerCase() === code
    ) ?? null;
  }, [permissions]);

  const getPermissionOrAllow = useCallback((menuCode: string): MenuPermission => {
    const p = getPermission(menuCode);
    if (p) return p;
    // ถ้าหาไม่เจอ → allow ทั้งหมด เพื่อไม่ให้ page โล่ง
    return { menuId: 0, menuCode, title: menuCode, parentId: null, ...ALL_ALLOW };
  }, [getPermission]);

  return (
    <PermissionContext.Provider value={{ roleId, appName, permissions, loading, setRoleId, setAppName, getPermission, getPermissionOrAllow, refreshPermissions: fetchPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

// ---------- Hook ----------

export function usePermissions() {
  return useContext(PermissionContext);
}

/**
 * Hook สำหรับแต่ละ page — ระบุ menuCode แล้วได้ permission กลับมาพร้อมใช้
 * @example const { canAdd, canEdit, canDelete, canExport } = usePagePermission('system-users');
 */
export function usePagePermission(menuCode: string) {
  const { getPermissionOrAllow } = usePermissions();
  return getPermissionOrAllow(menuCode);
}

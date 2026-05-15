'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, X, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { coreRoleApi } from '../services/api';
import { BaseModal } from './CrudComponents';
import { useApiConfig } from '../contexts/ApiConfigContext';

// App name mapping (display -> api value)
const APP_MAP: Record<string, string> = {
  'NexCore': 'NexCore',
  'NexStream': 'NexStream',
  'NexOne': 'NexOne',
};
const FALLBACK_SYSTEM_APPS = Object.keys(APP_MAP);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

interface MenuNode {
  menuId: string;
  parentId: string | null;
  title: string;
  menuCode: string;
  menuSeq: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;
  isActive: boolean;
  permissionId: string | null;
  menuType?: string; // e.g. 'heading', 'submenu', 'menu'
  children: MenuNode[];
  // Runtime state
  useToggle?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '38px', height: '21px', borderRadius: '11px',
        background: checked ? '#2563eb' : '#cbd5e1',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s', flexShrink: 0, display: 'inline-block',
        boxShadow: checked ? '0 0 0 2px rgba(37,99,235,0.15)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: '2.5px',
        left: checked ? '19px' : '2.5px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function Checkbox({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={!disabled ? onChange : undefined}
      style={{
        width: '18px', height: '18px', borderRadius: '4px',
        border: `2px solid ${checked && !disabled ? '#2563eb' : '#cbd5e1'}`,
        background: checked && !disabled ? '#2563eb' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      {checked && !disabled && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Menu Row Component ───────────────────────────────────────────────────────

function MenuRow({
  node,
  level,
  hasChildren,
  collapsed,
  parentDisabled,
  onCollapseToggle,
  onToggleUse,
  onTogglePerm,
}: {
  node: MenuNode;
  level: number;
  hasChildren: boolean;
  collapsed: boolean;
  parentDisabled: boolean; // true when any ancestor group is OFF
  onCollapseToggle: (menuId: string) => void;
  onToggleUse: (menuId: string) => void;
  onTogglePerm: (menuId: string, field: any) => void;
}) {
  const isTop = level === 0;
  const indentBase = level === 0 ? 12 : level === 1 ? 28 : 48;
  const useOn = node.isActive;
  // Children are fully disabled if their parent group is OFF
  const isDisabled = parentDisabled;
  const bgColor = isTop
    ? '#f1f5f9'
    : level === 1
      ? isDisabled ? '#fafafa' : '#f8fafc'
      : isDisabled ? '#fafafa' : 'transparent';

  return (
    <tr
      style={{
        borderBottom: '1px solid #f1f5f9',
        background: bgColor,
        opacity: isDisabled ? 0.45 : 1,
        transition: 'background 0.1s, opacity 0.2s',
        pointerEvents: isDisabled ? 'none' : 'auto', // block all clicks when disabled
      }}
      onMouseEnter={e => { if (!isTop && !isDisabled) (e.currentTarget as HTMLElement).style.background = level === 1 ? '#f0f4ff' : '#fafbff'; }}
      onMouseLeave={e => { if (!isTop && !isDisabled) (e.currentTarget as HTMLElement).style.background = bgColor; }}
    >
      <td style={{
        paddingLeft: `${indentBase}px`,
        paddingTop: isTop ? '11px' : '9px',
        paddingBottom: isTop ? '11px' : '9px',
        paddingRight: '16px',
        fontSize: isTop ? '14px' : level === 1 ? '13px' : '13px',
        fontWeight: isTop ? 700 : level === 1 ? 500 : 400,
        color: isTop
          ? '#1e293b'
          : isDisabled
            ? '#94a3b8'
            : level === 1 ? '#2563eb' : '#475569',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasChildren ? (
            <span
              onClick={() => onCollapseToggle(node.menuId)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '20px', height: '20px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isTop ? '#64748b' : '#94a3b8',
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span style={{ display: 'inline-block', width: '20px', flexShrink: 0 }}>
              {level === 2 && <span style={{ color: '#cbd5e1', fontSize: '14px', marginLeft: '4px' }}>—</span>}
            </span>
          )}
          <span>{node.title}</span>
        </div>
      </td>

      {/* ใช้งาน toggle — disabled visually if parent is OFF */}
      <td style={{ padding: '9px 4px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Toggle checked={useOn && !isDisabled} onChange={() => onToggleUse(node.menuId)} />
        </div>
      </td>

      {/* Checkboxes */}
      {isTop ? (
        <td colSpan={6} />
      ) : (
        (['canView', 'canAdd', 'canEdit', 'canDelete', 'canImport', 'canExport'] as const).map(field => (
          <td key={field} style={{ padding: '9px 4px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Checkbox
                checked={(node as any)[field] && !isDisabled}
                onChange={() => onTogglePerm(node.menuId, field as any)}
                disabled={!useOn || isDisabled}
              />
            </div>
          </td>
        ))
      )}
    </tr>
  );
}

function renderMenuTree(
  nodes: MenuNode[],
  level: number,
  collapsedIds: Set<string>,
  onCollapseToggle: (id: string) => void,
  onToggleUse: (id: string) => void,
  onTogglePerm: (id: string, field: any) => void,
  ancestorDisabled: boolean = false, // true if any parent group is OFF
): React.ReactNode {
  return nodes.map(node => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedIds.has(node.menuId);
    // Children are disabled if THIS node is a group (has children) and is OFF
    // OR if an ancestor is already disabled
    const childrenDisabled = ancestorDisabled || (hasChildren ? !node.isActive : false);
    return (
      <React.Fragment key={node.menuId}>
        <MenuRow
          node={node}
          level={level}
          hasChildren={!!hasChildren}
          collapsed={isCollapsed}
          parentDisabled={ancestorDisabled}
          onCollapseToggle={onCollapseToggle}
          onToggleUse={onToggleUse}
          onTogglePerm={onTogglePerm}
        />
        {hasChildren && !isCollapsed &&
          renderMenuTree(
            node.children, level + 1,
            collapsedIds, onCollapseToggle, onToggleUse, onTogglePerm,
            childrenDisabled,  // ← pass disabled state into children
          )
        }
      </React.Fragment>
    );
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoleSettings() {
  const { getEndpoint } = useApiConfig();
  const coreApi = getEndpoint('NexCore', '');
  const API_URL = `${coreApi}/v1/system-apps`;

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, message: string, isError: boolean }>({ isOpen: false, message: '', isError: false });
  const [systemApps, setSystemApps] = useState<string[]>(FALLBACK_SYSTEM_APPS);

  const handleCollapseToggle = useCallback((menuId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(menuId) ? next.delete(menuId) : next.add(menuId);
      return next;
    });
  }, []);

  // Add Role modal
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Edit Role modal
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [selectedApp, setSelectedApp] = useState('NexCore');

  const fetchSystemApps = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const json = await res.json();
      const apps = (json && json.data !== undefined) ? json.data : json;
      if (Array.isArray(apps)) {
        const activeAppNames = apps.map(a => a.app_name).filter(Boolean);
        if (activeAppNames.length > 0) {
          setSystemApps(activeAppNames);
          if (!activeAppNames.includes(selectedApp)) {
            setSelectedApp(activeAppNames[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch system apps', e);
    }
  }, [API_URL, selectedApp]);

  useEffect(() => {
    fetchSystemApps();
  }, [fetchSystemApps]);

  // ── Fetch roles list ──────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${coreApi}/roles`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Role API Error: ${res.status}`);
      const json = await res.json();
      
      let data = json;
      if (json?.data) {
          data = Array.isArray(json.data) ? json.data : (json.data.data || []);
      }
      
      if (Array.isArray(data)) {
        const mapped: Role[] = data.map((r: any) => ({
          id: (r.roleId || r.id || '').toString(),
          name: r.roleName || r.name || 'Untitled Role',
          description: r.description || '',
          isSystem: !!r.isSystem,
        }));
        const sorted = [...mapped].sort((a, b) => a.name.localeCompare(b.name));
        setRoles(sorted);
        if (mapped.length > 0 && !selectedId) {
          setSelectedId(mapped[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch roles:', e);
    }
  }, [coreApi, selectedId]);
  // ── Fetch menu permissions ────────────────────────────────────────────────
  const fetchPermissions = useCallback(async (roleId: string, appDisplay: string) => {
    setLoadingMenu(true);
    try {
      const res = await fetch(`${coreApi}/roles/${roleId}/permissions?app=${APP_MAP[appDisplay] || appDisplay}`, { credentials: 'include' });
      const json = await res.json();
      const data = json.data !== undefined ? json.data : json;
      console.log('Fetched menuTree data:', data);
      if (Array.isArray(data)) {
        setMenuTree(data);
        setCollapsedIds(new Set());
      } else {
        setMenuTree([]);
      }
    } catch (e) {
      console.error('Failed to fetch permissions:', e);
      setMenuTree([]);
    } finally {
      setLoadingMenu(false);
      setHasChanges(false);
    }
  }, [coreApi]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    if (selectedId) fetchPermissions(selectedId, selectedApp);
  }, [selectedId, selectedApp, fetchPermissions]);

  // ── Toggle use (enable/disable entire menu row) → maps to is_active
  const handleToggleUse = (menuId: string) => {
    if (!menuTree) return;

    console.log('--- handleToggleUse START ---', { menuId });

    const idsToToggle = new Set<string>();
    let newActiveState = false;

    // 1. Find the target node
    const findTarget = (nodes: MenuNode[]): MenuNode | null => {
      for (const n of nodes) {
        if (String(n.menuId) === String(menuId)) return n;
        if (n.children) {
          const found = findTarget(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const target = findTarget(menuTree);
    if (!target) {
      console.log('Target not found for menuId:', menuId);
      return;
    }

    newActiveState = !target.isActive;
    idsToToggle.add(String(target.menuId));
    console.log('Target found:', { title: target.title, type: target.menuType || (target as any).menu_type, newActiveState });

    // 2. Collect descendants helper
    const collectDescendants = (nodes: MenuNode[]) => {
      nodes.forEach(n => {
        idsToToggle.add(String(n.menuId));
        if (n.children) collectDescendants(n.children);
      });
    };

    // 3. If heading, collect sequential siblings + their descendants
    let mType = target.menuType || (target as any).menu_type;

    // SMART FALLBACK: If type is missing, but it's a root node with no children,
    // it's likely a visual heading in this system's structure.
    if (!mType && !target.parentId && (!target.children || target.children.length === 0)) {
      console.log('Smart Fallback: Treating as heading based on structure');
      mType = 'heading';
    }

    if (String(mType).toLowerCase() === 'heading') {
      const findAndAddSiblings = (nodes: MenuNode[]) => {
        const idx = nodes.findIndex(n => String(n.menuId) === String(menuId));
        if (idx !== -1) {
          console.log(`Found ${target.title} at index ${idx}. Checking siblings...`);
          for (let i = idx + 1; i < nodes.length; i++) {
            let sibType = nodes[i].menuType || (nodes[i] as any).menu_type;

            // Smart Fallback for siblings too
            if (!sibType && !nodes[i].parentId && (!nodes[i].children || nodes[i].children.length === 0)) {
              sibType = 'heading';
            }

            if (String(sibType).toLowerCase() === 'heading') {
              console.log('Next heading found:', nodes[i].title, '- stopping sibling collection.');
              break;
            }
            console.log('Adding sibling:', nodes[i].title);
            idsToToggle.add(String(nodes[i].menuId));
            if (nodes[i].children) collectDescendants(nodes[i].children!);
          }
        } else {
          for (const n of nodes) {
            if (n.children) findAndAddSiblings(n.children);
          }
        }
      };
      findAndAddSiblings(menuTree);
    }

    // 4. Always add target's own descendants
    if (target.children) {
      console.log('Adding descendants of target...');
      collectDescendants(target.children);
    }

    console.log('IDs to toggle:', Array.from(idsToToggle));

    // 5. Apply state
    const apply = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map(n => {
        const children = n.children ? apply(n.children) : n.children;
        if (idsToToggle.has(String(n.menuId))) {
          return {
            ...n,
            isActive: newActiveState,
            canView: newActiveState,
            canAdd: newActiveState,
            canEdit: newActiveState,
            canDelete: newActiveState,
            canImport: newActiveState,
            canExport: newActiveState,
            children
          };
        }
        return { ...n, children };
      });
    };

    const nextTree = apply(menuTree);
    setMenuTree(nextTree);
    setHasChanges(true);
    console.log('--- handleToggleUse END ---');
  };

  const handleTogglePerm = (menuId: string, field: keyof MenuNode) => {
    if (!menuTree) return;

    const idsToToggle = new Set<string>();
    let newValue = false;

    const findTarget = (nodes: MenuNode[]): MenuNode | null => {
      for (const n of nodes) {
        if (String(n.menuId) === String(menuId)) return n;
        if (n.children) {
          const found = findTarget(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const target = findTarget(menuTree);
    if (!target) return;

    newValue = !(target as any)[field];
    idsToToggle.add(String(target.menuId));

    const collectDescendants = (nodes: MenuNode[]) => {
      nodes.forEach(n => {
        idsToToggle.add(String(n.menuId));
        if (n.children) collectDescendants(n.children);
      });
    };

    // 3. If heading, collect sequential siblings + their descendants
    let mType = target.menuType || (target as any).menu_type;

    // SMART FALLBACK: If type is missing, but it's a root node with no children,
    // it's likely a visual heading in this system's structure.
    if (!mType && !target.parentId && (!target.children || target.children.length === 0)) {
      mType = 'heading';
    }

    if (String(mType).toLowerCase() === 'heading') {
      const findAndAddSiblings = (nodes: MenuNode[]) => {
        const idx = nodes.findIndex(n => String(n.menuId) === String(menuId));
        if (idx !== -1) {
          for (let i = idx + 1; i < nodes.length; i++) {
            let sibType = nodes[i].menuType || (nodes[i] as any).menu_type;

            // Smart Fallback for siblings too
            if (!sibType && !nodes[i].parentId && (!nodes[i].children || nodes[i].children.length === 0)) {
              sibType = 'heading';
            }

            if (String(sibType).toLowerCase() === 'heading') break;
            idsToToggle.add(String(nodes[i].menuId));
            if (nodes[i].children) collectDescendants(nodes[i].children!);
          }
        } else {
          for (const n of nodes) {
            if (n.children) findAndAddSiblings(n.children);
          }
        }
      };
      findAndAddSiblings(menuTree);
    }

    if (target.children) collectDescendants(target.children);

    const apply = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map(n => {
        const children = n.children ? apply(n.children) : n.children;
        if (idsToToggle.has(String(n.menuId))) {
          return { ...n, [field]: newValue, children };
        }
        return { ...n, children };
      });
    };

    setMenuTree(apply(menuTree));
    setHasChanges(true);
  };

  // ── Flatten tree for saving ───────────────────────────────────────────────
  const flattenTree = (nodes: MenuNode[]): MenuNode[] => {
    const result: MenuNode[] = [];
    const walk = (list: MenuNode[]) => {
      list.forEach(n => { result.push(n); if (n.children?.length) walk(n.children); });
    };
    walk(nodes);
    return result;
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const flat = flattenTree(menuTree);
      const permissions = flat.map(n => ({
        menuId: n.menuId,
        permissionId: n.permissionId,
        isActive: n.isActive,
        canView: n.canView,
        canAdd: n.canAdd,
        canEdit: n.canEdit,
        canDelete: n.canDelete,
        canImport: n.canImport,
        canExport: n.canExport,
      }));
      const res = await fetch(`${coreApi}/roles/${selectedId}/permissions?app=${APP_MAP[selectedApp] || selectedApp}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to save permissions');
      
      setHasChanges(false);
      // Refresh to get new permissionIds
      await fetchPermissions(selectedId, selectedApp);
      setAlertConfig({
        isOpen: true,
        message: 'บันทึกสิทธิ์การใช้งานเรียบร้อยแล้ว',
        isError: false
      });
    } catch (e: any) {
      console.error('Failed to save permissions:', e);
      setAlertConfig({
        isOpen: true,
        message: e.message || 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์',
        isError: true
      });
    } finally {
      setSaving(false);
    }
  };

  // ── CRUD Roles ────────────────────────────────────────────────────────────
  const handleAddRole = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${coreApi}/roles`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: newName.trim(), description: newDesc.trim() || undefined }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to add role');
      await fetchRoles();
      setNewName(''); setNewDesc(''); setShowAdd(false);
    } catch (e) { console.error('Failed to add role', e); }
  };

  const handleDeleteRole = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('ยืนยันการลบบทบาทนี้?')) return;
    try {
      const res = await fetch(`${coreApi}/roles/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete role');
      await fetchRoles();
    } catch (err) { console.error('Failed to delete role', err); }
  };

  const handleEditRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(role.id);
    setEditName(role.name);
    setEditDesc(role.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim()) return;
    try {
      const res = await fetch(`${coreApi}/roles/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: editName.trim(), description: editDesc.trim() || undefined }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update role');
      await fetchRoles();
      setEditId(null);
    } catch (e) { console.error('Failed to update role', e); }
  };

  const selectedRole = roles.find(r => r.id === selectedId);

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 80px)', minHeight: '600px' }}>

      {/* ── Left Panel: Role List ── */}
      <div style={{
        width: '230px', flexShrink: 0, background: '#fff',
        borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
      }}>
        <div style={{ padding: '14px' }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              background: '#1e40af', color: '#fff', border: 'none',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9f')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1e40af')}
          >
            <Plus size={15} /> Add Role
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {roles.map(role => {
            const isSelected = selectedId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedId(role.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: `3px solid ${isSelected ? '#2563eb' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  color: role.isSystem ? '#2563eb' : (isSelected ? '#1d4ed8' : '#374151'),
                  fontWeight: isSelected ? 600 : 400, fontSize: '14px',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {role.name}
                </span>
                <div style={{ display: 'flex', gap: '2px', marginLeft: '4px', opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}>
                  <button
                    onClick={e => handleEditRole(role, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 3px', borderRadius: '4px', lineHeight: 1 }}
                    title="แก้ไข"
                  ><Pencil size={13} /></button>
                  <button
                    onClick={e => handleDeleteRole(role.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 3px', borderRadius: '4px', lineHeight: 1 }}
                    title="ลบ"
                  ><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: Permission Matrix ── */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', background: '#fafbff', flexShrink: 0 }}>
          <select
            value={selectedApp}
            onChange={e => setSelectedApp(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer', background: '#fff', color: '#374151', fontWeight: 500, outline: 'none' }}
          >
            {systemApps.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <ShieldCheck size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{selectedRole?.name || '—'}</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Module Access</span>
          </div>

          <button
            onClick={handleSavePermissions}
            disabled={!hasChanges || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '8px',
              background: hasChanges ? '#1e40af' : '#e2e8f0',
              color: hasChanges ? '#fff' : '#94a3b8',
              border: 'none', cursor: hasChanges ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
            }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Permission Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingMenu ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '14px' }}>
              กำลังโหลดข้อมูล...
            </div>
          ) : menuTree.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '14px' }}>
              ไม่พบข้อมูลเมนูสำหรับ {selectedApp}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>MODULE PERMISSION</th>
                  {['ใช้งาน', 'ดู', 'เพิ่ม', 'แก้ไข', 'ลบ', 'นำเข้า', 'ส่งออก'].map(h => (
                    <th key={h} style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', padding: '12px 4px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', minWidth: '56px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderMenuTree(menuTree, 0, collapsedIds, handleCollapseToggle, handleToggleUse, handleTogglePerm)}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add Role Modal ── */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px', margin: 0 }}>+ เพิ่มบทบาทใหม่</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>ชื่อบทบาท (Role Name)</label>
            <input
              type="text" autoFocus value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddRole()}
              placeholder="เช่น Sale Manager, IT Staff..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
            />
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '16px', display: 'block' }}>รายละเอียด (Description)</label>
            <input
              type="text" value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="ใส่รายละเอียดเพิ่มเติม..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>ยกเลิก</button>
              <button onClick={handleAddRole} style={{ padding: '9px 22px', borderRadius: '8px', background: '#1e40af', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>เพิ่ม</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Role Modal ── */}
      {editId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px', margin: 0 }}>แก้ไขชื่อบทบาท</h3>
              <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>ชื่อบทบาท (Role Name)</label>
            <input
              type="text" autoFocus value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
            />
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '16px', display: 'block' }}>รายละเอียด (Description)</label>
            <input
              type="text" value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditId(null)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>ยกเลิก</button>
              <button onClick={handleSaveEdit} style={{ padding: '9px 22px', borderRadius: '8px', background: '#1e40af', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Modal ── */}
      <BaseModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.isError ? 'เกิดข้อผิดพลาด' : 'สำเร็จ'}
        width="400px"
        footer={
          <button
            onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            style={{ padding: '10px 24px', background: alertConfig.isError ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            ตกลง
          </button>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            {alertConfig.isError ? (
              <Info size={32} style={{ color: '#ef4444' }} />
            ) : (
              <div style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold' }}>✓</div>
            )}
          </div>
          <p style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 500, lineHeight: '1.6' }}>
            {alertConfig.message}
          </p>
        </div>
      </BaseModal>
    </div>
  );
}

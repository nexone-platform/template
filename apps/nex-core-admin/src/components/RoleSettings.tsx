'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, X, ShieldCheck, ChevronRight } from 'lucide-react';

const API = 'http://localhost:8001';

// App name mapping (display -> api value)
const APP_MAP: Record<string, string> = {
  'NexCore': 'nex-core',
  'NexSite': 'nex-site',
  'NexSpeed': 'nex-speed',
};
const SYSTEM_APPS = Object.keys(APP_MAP);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

interface MenuNode {
  menuId: number;
  parentId: number | null;
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
  permissionId: number | null;
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
  onCollapseToggle: (menuId: number) => void;
  onToggleUse: (menuId: number) => void;
  onTogglePerm: (menuId: number, field: any) => void;
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
  collapsedIds: Set<number>,
  onCollapseToggle: (id: number) => void,
  onToggleUse: (id: number) => void,
  onTogglePerm: (id: number, field: any) => void,
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const handleCollapseToggle = useCallback((menuId: number) => {
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

  // ── Fetch roles list ──────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/roles`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Role[] = data.map((r: any) => ({
          id: r.roleId.toString(),
          name: r.roleName,
          description: r.description,
          isSystem: r.roleName === 'Admin' || r.roleName === 'SuperAdmin',
        }));
        setRoles(mapped);
        if (mapped.length > 0) {
          setSelectedId(prev => (mapped.find(r => r.id === prev) ? prev : mapped[0].id));
        }
      }
    } catch (e) {
      console.error('Failed to fetch roles:', e);
    }
  }, []);

  // ── Fetch menu permissions ────────────────────────────────────────────────
  const fetchPermissions = useCallback(async (roleId: string, appDisplay: string) => {
    const appKey = APP_MAP[appDisplay] || 'nex-core';
    setLoadingMenu(true);
    try {
      const res = await fetch(`${API}/api/roles/${roleId}/permissions?app=${appKey}`);
      if (res.ok) {
        const data: MenuNode[] = await res.json();
        setMenuTree(data);
        setCollapsedIds(new Set()); // reset collapse state on load
        setHasChanges(false);
      }
    } catch (e) {
      console.error('Failed to fetch permissions:', e);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    if (selectedId) fetchPermissions(selectedId, selectedApp);
  }, [selectedId, selectedApp, fetchPermissions]);

  // ── Toggle use (enable/disable entire menu row) → maps to is_active
  const handleToggleUse = (menuId: number) => {
    // Helper: recursively set isActive (and clear perms when disabling) on all descendants
    const setChildrenActive = (nodes: MenuNode[], active: boolean): MenuNode[] =>
      nodes.map(n => ({
        ...n,
        isActive: active,
        canView:   active,
        canAdd:    active,
        canEdit:   active,
        canDelete: active,
        canImport: active,
        canExport: active,
        children: n.children?.length ? setChildrenActive(n.children, active) : n.children,
      }));

    const toggle = (nodes: MenuNode[]): MenuNode[] =>
      nodes.map(n => {
        if (n.menuId === menuId) {
          const newActive = !n.isActive;
          return {
            ...n,
            isActive: newActive,
            // Open → grant all permissions; Close → revoke all permissions
            canView:   newActive,
            canAdd:    newActive,
            canEdit:   newActive,
            canDelete: newActive,
            canImport: newActive,
            canExport: newActive,
            // Cascade to all children
            children: n.children?.length
              ? setChildrenActive(n.children, newActive)
              : n.children,
          };
        }
        if (n.children?.length) return { ...n, children: toggle(n.children) };
        return n;
      });
    setMenuTree(prev => toggle(prev));
    setHasChanges(true);
  };

  // ── Toggle individual permission checkbox ─────────────────────────────────
  const handleTogglePerm = (menuId: number, field: string) => {
    const toggle = (nodes: MenuNode[]): MenuNode[] =>
      nodes.map(n => {
        if (n.menuId === menuId) return { ...n, [field]: !(n as any)[field] };
        if (n.children?.length) return { ...n, children: toggle(n.children) };
        return n;
      });
    setMenuTree(prev => toggle(prev));
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

  // ── Save permissions ──────────────────────────────────────────────────────
  const handleSavePermissions = async () => {
    const appKey = APP_MAP[selectedApp] || 'nex-core';
    setSaving(true);
    try {
      const flat = flattenTree(menuTree);
      const permissions = flat.map(n => ({
        menuId: n.menuId,
        permissionId: n.permissionId,
        isActive: n.isActive,      // ← from is_active column
        canView: n.canView,
        canAdd: n.canAdd,
        canEdit: n.canEdit,
        canDelete: n.canDelete,
        canImport: n.canImport,
        canExport: n.canExport,
      }));
      const res = await fetch(`${API}/api/roles/${selectedId}/permissions?app=${appKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (res.ok) {
        setHasChanges(false);
        // Refresh to get new permissionIds
        await fetchPermissions(selectedId, selectedApp);
      }
    } catch (e) {
      console.error('Failed to save permissions:', e);
    } finally {
      setSaving(false);
    }
  };

  // ── CRUD Roles ────────────────────────────────────────────────────────────
  const handleAddRole = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: newName.trim(), description: newDesc.trim() || undefined }),
      });
      if (res.ok) {
        await fetchRoles();
        setNewName(''); setNewDesc(''); setShowAdd(false);
      }
    } catch (e) { console.error('Failed to add role', e); }
  };

  const handleDeleteRole = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('ยืนยันการลบบทบาทนี้?')) return;
    try {
      const res = await fetch(`${API}/api/roles/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchRoles();
    } catch (err) { console.error('Failed to delete role', err); }
  };

  const handleEditRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(role.id);
    setEditName(role.name);
    setEditDesc(role.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`${API}/api/roles/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: editName.trim(), description: editDesc.trim() || undefined }),
      });
      if (res.ok) {
        await fetchRoles();
        setEditId(null);
      }
    } catch (err) { console.error('Failed to edit role', err); }
  };

  const selectedRole = roles.find(r => r.id === selectedId);

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 180px)', minHeight: '600px' }}>

      {/* ── Left Panel: Role List ── */}
      <div style={{
        width: '230px', flexShrink: 0, background: '#fff',
        borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
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
            <Plus size={15} /> + Add Role
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
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', background: '#fafbff', flexShrink: 0 }}>
          <select
            value={selectedApp}
            onChange={e => setSelectedApp(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer', background: '#fff', color: '#374151', fontWeight: 500, outline: 'none' }}
          >
            {SYSTEM_APPS.map(a => <option key={a} value={a}>{a}</option>)}
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
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>MODULE PERMISSION</th>
                  {['ใช้งาน', 'ดู', 'เพิ่ม', 'แก้ไข', 'ลบ', 'นำเข้า', 'ส่งออก'].map(h => (
                    <th key={h} style={{ padding: '12px 4px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', minWidth: '56px' }}>{h}</th>
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
    </div>
  );
}

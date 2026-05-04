'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, X, LayoutTemplate, Link as LinkIcon, Eye, EyeOff, Trash } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@nexone/ui';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { IconPickerModal, renderIcon } from './IconPickerModal';

interface PageMenu {
  menu_id?: number | string;
  menu_code?: string;
  title?: string;
  route?: string;
  page_key?: string;
  is_active?: boolean;
  icon?: string;
  app_name?: string;
  parent_id?: string | number | null;
  menu_seq?: number;
  menu_type?: string;
  translations?: Record<string, string>;
}

interface PageMenuWithChildren extends PageMenu {
  children: PageMenuWithChildren[];
}

const SYSTEM_APPS = [
  'NexCore', 'NexSite', 'NexForce', 'NexSpeed', 'NexCost', 'NexLess', 'NexStock', 'NexSales', 'NexFinance', 'NexProcure',
  'NexProduce', 'NexBI', 'NexPOS', 'NexPayroll', 'NexAsset', 'NexTax', 'NexApprove', 'NexAudit', 'NexConnect', 
  'NexDelivery', 'NexMaint', 'NexLearn', 'Central Auth', 'ALL'
];

export default function AppMenus() {
  const [menus, setMenus] = useState<PageMenu[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('NexCore');
  const [selectedMenuId, setSelectedMenuId] = useState<number | string | null>(null);
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>({});
  const [draggedMenuId, setDraggedMenuId] = useState<string | number | null>(null);
  const [dragOverMenuId, setDragOverMenuId] = useState<string | number | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'inside' | 'after' | null>(null);
  const [formData, setFormData] = useState<Partial<PageMenu>>({});
  const [positionType, setPositionType] = useState<'last' | 'before' | 'after'>('last');
  const [referenceMenuId, setReferenceMenuId] = useState<string | number>('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [activeApps, setActiveApps] = useState<string[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  
  const { success, error } = useToast();

  const { getEndpoint } = useApiConfig();
  const coreApi = getEndpoint('NexCore', 'http://localhost:8101/api');
  const API_URL = `${coreApi}/menus`;

  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?all=true`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenus(data);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(`${coreApi}/v1/system-apps?all=true`, { credentials: 'include' });
        if (!res.ok) throw new Error('API returned ' + res.status);
        const data = await res.json();
        const appsList = data.data || data;
        if (Array.isArray(appsList)) {
          const activeNames = appsList.filter((a: any) => a.is_active === true || a.is_active === 'true' || a.is_active === 1).map((a: any) => a.app_name);
          setActiveApps([...activeNames, 'ALL']);
        } else {
          setActiveApps(['Parse Error', ...SYSTEM_APPS]);
        }
      } catch (err: any) {
        console.error('Error fetching system apps:', err);
        setActiveApps(['Fetch Error', ...SYSTEM_APPS]);
      }
    };
    fetchApps();

    const fetchLanguages = async () => {
      try {
        const res = await fetch(`${coreApi}/translations/languages`, { credentials: 'include' });
        const json = await res.json();
        const langs = (json && json.data !== undefined) ? json.data : json;
        if (Array.isArray(langs)) setLanguages(langs);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };
    fetchLanguages();
  }, [coreApi]);

  const normalizeAppName = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const filteredMenus = menus.filter(m => 
    normalizeAppName(m.app_name || 'ALL') === normalizeAppName(selectedApp) || 
    (selectedApp === 'ALL')
  );

  useEffect(() => {
    if (selectedMenuId) {
      const menu = menus.find(m => String(m.menu_id) === String(selectedMenuId));
      if (menu) {
        setFormData({ ...menu });
        setIsEditing(true);
      } else {
        setFormData({});
        setIsEditing(false);
      }
    } else {
      setFormData({ app_name: selectedApp, is_active: true });
      setIsEditing(true);
    }
  }, [selectedMenuId, menus, selectedApp]);

  const handleAddNew = () => {
    setSelectedMenuId(null);
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.menu_code?.trim()) {
      error('กรุณากรอกรหัสและชื่อเมนู');
      return;
    }
    if (formData.menu_type === 'menu' && !formData.route?.trim()) {
      error('กรุณาระบุเส้นทาง (Route/Path) สำหรับเมนูที่ใช้งาน');
      return;
    }

    setSaving(true);
    try {
      let finalMenuSeq = formData.menu_seq || 0;
      let computedParentId = formData.menu_type === 'heading' ? null : formData.parent_id;

      if (positionType !== 'last' && referenceMenuId) {
        const siblings = filteredMenus.filter(m => m.parent_id === computedParentId && String(m.menu_id) !== String(selectedMenuId));
        siblings.sort((a,b) => (a.menu_seq || 0) - (b.menu_seq || 0));
        const refIndex = siblings.findIndex(m => String(m.menu_id) === String(referenceMenuId));
        
        if (refIndex !== -1) {
            if (positionType === 'before') {
                const prevNode = siblings[refIndex - 1];
                const nextNode = siblings[refIndex];
                if (prevNode) finalMenuSeq = Math.floor(((prevNode.menu_seq || 0) + (nextNode.menu_seq || 0)) / 2);
                else finalMenuSeq = (nextNode.menu_seq || 0) - 10;
            } else if (positionType === 'after') {
                const prevNode = siblings[refIndex];
                const nextNode = siblings[refIndex + 1];
                if (nextNode) finalMenuSeq = Math.floor(((prevNode.menu_seq || 0) + (nextNode.menu_seq || 0)) / 2);
                else finalMenuSeq = (prevNode.menu_seq || 0) + 10;
            }
        }
      } else if (!selectedMenuId) {
        const siblings = filteredMenus.filter(m => m.parent_id === computedParentId);
        siblings.sort((a,b) => (a.menu_seq || 0) - (b.menu_seq || 0));
        const lastNode = siblings[siblings.length - 1];
        if (lastNode) finalMenuSeq = (lastNode.menu_seq || 0) + 10;
        else finalMenuSeq = 10;
      }

      const payloadToSave = { ...formData, menu_seq: finalMenuSeq, parent_id: computedParentId };

      const method = selectedMenuId ? 'PUT' : 'POST';
      const url = selectedMenuId ? `${API_URL}/${selectedMenuId}` : API_URL;
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSave),
      });

      if (res.ok) {
        await fetchMenus();
        if (!selectedMenuId) {
          const newData = await res.json();
          if (newData && newData.menu_id) {
            setSelectedMenuId(newData.menu_id);
          }
        }
        success('บันทึกข้อมูลเรียบร้อย');
      } else {
        try {
          const errorData = await res.json();
          error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } catch {
          error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      }
    } catch (err) {
      console.error('Error saving menu:', err);
      error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('ยืนยันการลบเมนูนี้?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        if (selectedMenuId === id) setSelectedMenuId(null);
        await fetchMenus();
        success('ลบเมนูเรียบร้อย');
      } else {
        try {
          const errorData = await res.json();
          error(errorData.message || 'เกิดข้อผิดพลาดในการลบเมนู');
        } catch {
          error('เกิดข้อผิดพลาดในการลบเมนู');
        }
      }
    } catch (err) {
      console.error('Failed to delete menu', err);
      error('เกิดข้อผิดพลาดในการลบเมนู');
    }
  };

  const handleToggleStatus = async (id: string | number, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        await fetchMenus();
        success('ปรับสถานะเรียบร้อย');
      } else {
        try {
          const errorData = await res.json();
          error(errorData.message || 'เกิดข้อผิดพลาดในการปรับสถานะ');
        } catch {
          error('เกิดข้อผิดพลาดในการปรับสถานะ');
        }
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
      error('เกิดข้อผิดพลาดในการปรับสถานะ');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', 
    borderRadius: '8px', fontSize: '14px', outline: 'none', 
    marginTop: '6px', boxSizing: 'border-box' as const
  };

  const labelStyle = { fontSize: '13px', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' };

  const toggleCollapse = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const buildTree = (items: PageMenu[]): PageMenuWithChildren[] => {
    const map = new Map<string | number, PageMenuWithChildren>();
    items.forEach(item => {
      if (item.menu_id) map.set(item.menu_id, { ...item, children: [] });
    });
    
    const tree: PageMenuWithChildren[] = [];
    
    items.forEach(item => {
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.children.push(map.get(item.menu_id!)!);
      } else if (item.menu_id) {
        tree.push(map.get(item.menu_id)!);
      }
    });
    
    const sortTree = (nodes: PageMenuWithChildren[]) => {
      nodes.sort((a, b) => (a.menu_seq || 0) - (b.menu_seq || 0));
      nodes.forEach(node => sortTree(node.children));
    };
    sortTree(tree);
    
    return tree;
  };

  const handleDragStart = (e: React.DragEvent, menuId: string | number) => {
    e.dataTransfer.setData('text/plain', String(menuId));
    setDraggedMenuId(menuId);
  };

  const handleDragOver = (e: React.DragEvent, targetMenuId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedMenuId === targetMenuId) {
      setDragOverMenuId(null);
      setDragPosition(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    if (y < rect.height * 0.25) {
      setDragPosition('before');
    } else if (y > rect.height * 0.75) {
      setDragPosition('after');
    } else {
      setDragPosition('inside');
    }
    
    setDragOverMenuId(targetMenuId);
  };

  const handleDragLeave = () => {
    setDragOverMenuId(null);
    setDragPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, targetMenuId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    setDraggedMenuId(null);
    setDragOverMenuId(null);
    setDragPosition(null);

    if (!draggedId || draggedId === String(targetMenuId)) return;

    const draggedNode = menus.find(m => String(m.menu_id) === draggedId);
    const targetNode = menus.find(m => String(m.menu_id) === String(targetMenuId));

    if (!draggedNode || !targetNode) return;

    let currentTarget: PageMenu | undefined = targetNode;
    while (currentTarget) {
      if (String(currentTarget.menu_id) === draggedId) {
        error('ไม่สามารถย้ายเมนูแม่เข้าไปในเมนูลูกของตัวเองได้');
        return;
      }
      currentTarget = menus.find(m => m.menu_id === currentTarget!.parent_id);
    }

    let newParentId = draggedNode.parent_id || null;
    let newSeq = 0;

    if (dragPosition === 'inside') {
      newParentId = targetNode.menu_id || null;
      const children = menus.filter(m => m.parent_id === newParentId && String(m.menu_id) !== draggedId);
      children.sort((a,b) => (a.menu_seq || 0) - (b.menu_seq || 0));
      const lastChild = children[children.length - 1];
      newSeq = lastChild ? (lastChild.menu_seq || 0) + 10 : (targetNode.menu_seq || 0) + 10;
    } else {
      newParentId = targetNode.parent_id || null;
      const siblings = menus.filter(m => m.parent_id === newParentId && String(m.menu_id) !== draggedId);
      siblings.sort((a,b) => (a.menu_seq || 0) - (b.menu_seq || 0));
      
      const targetIndex = siblings.findIndex(m => String(m.menu_id) === String(targetMenuId));
      if (targetIndex !== -1) {
        if (dragPosition === 'before') {
          const prevNode = siblings[targetIndex - 1];
          const nextNode = siblings[targetIndex];
          if (prevNode) {
            newSeq = Math.floor(((prevNode.menu_seq || 0) + (nextNode.menu_seq || 0)) / 2);
          } else {
            newSeq = (nextNode.menu_seq || 0) - 10;
          }
        } else {
          const prevNode = siblings[targetIndex];
          const nextNode = siblings[targetIndex + 1];
          if (nextNode) {
            newSeq = Math.floor(((prevNode.menu_seq || 0) + (nextNode.menu_seq || 0)) / 2);
          } else {
            newSeq = (prevNode.menu_seq || 0) + 10;
          }
        }
      } else {
        newSeq = (targetNode.menu_seq || 0) + 10;
      }
    }

    try {
      const payload: any = { menu_seq: newSeq, parent_id: newParentId };
      const res = await fetch(`${API_URL}/${draggedId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchMenus();
        success('ย้ายเมนูเรียบร้อย');
      } else {
        try {
          const errorData = await res.json();
          error(errorData.message || 'เกิดข้อผิดพลาดในการย้ายเมนู');
        } catch {
          error('เกิดข้อผิดพลาดในการย้ายเมนู');
        }
      }
    } catch (err) {
      console.error('Failed to move menu', err);
      error('เกิดข้อผิดพลาดในการย้ายเมนู');
    }
  };

  const treeData = buildTree(filteredMenus);

  const renderMenuNode = (node: PageMenuWithChildren, depth: number = 0) => {
    const isSelected = selectedMenuId === node.menu_id;
    const isCollapsed = !!collapsedMenus[node.menu_id!];
    const isDragOver = dragOverMenuId === node.menu_id;
    
    let dragStyle = {};
    if (isDragOver) {
      if (dragPosition === 'before') dragStyle = { borderTop: '2px solid #2563eb' };
      else if (dragPosition === 'after') dragStyle = { borderBottom: '2px solid #2563eb' };
      else if (dragPosition === 'inside') dragStyle = { background: 'rgba(37, 99, 235, 0.1)' };
    }
    
    return (
      <div 
        key={node.menu_id}
      >
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node.menu_id!)}
          onDragOver={(e) => handleDragOver(e, node.menu_id!)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.menu_id!)}
          onClick={() => setSelectedMenuId(node.menu_id || null)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `12px 14px 12px ${14 + (depth * 20)}px`,
            background: isSelected ? '#eff6ff' : 'transparent',
            borderLeft: `3px solid ${isSelected ? '#2563eb' : 'transparent'}`,
            borderBottom: '1px solid #f1f5f9',
            cursor: 'grab', transition: 'all 0.15s',
            color: isSelected ? '#1d4ed8' : '#374151',
            fontWeight: isSelected ? 600 : 400, fontSize: '14px',
            opacity: draggedMenuId === node.menu_id ? 0.5 : 1,
            ...dragStyle
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, justifyContent: node.menu_type === 'heading' ? 'center' : 'flex-start' }}>
            {node.menu_type !== 'heading' && (
              node.children.length > 0 ? (
                <span 
                  onClick={(e) => toggleCollapse(node.menu_id!, e)}
                  style={{ 
                    fontSize: '10px', color: '#94a3b8', 
                    transform: isCollapsed ? 'rotate(-90deg)' : 'none', 
                    display: 'inline-block', transition: 'transform 0.2s', 
                    cursor: 'pointer', padding: '2px 4px', marginLeft: '-4px'
                  }}
                >
                  ▼
                </span>
              ) : (
                <span style={{ width: '12px' }}></span>
              )
            )}
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              textTransform: node.menu_type === 'heading' ? 'uppercase' : 'none',
              fontWeight: node.menu_type === 'heading' ? 700 : 'inherit'
            }}>
              {node.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={e => node.menu_id && handleToggleStatus(node.menu_id, !!node.is_active, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: node.is_active ? '#3b82f6' : '#94a3b8', opacity: isSelected ? 1 : 0.5 }}
              title={node.is_active ? 'ซ่อน' : 'แสดง'}
            >
              {node.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              onClick={e => node.menu_id && handleDelete(node.menu_id, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: isSelected ? 1 : 0.5 }}
              title="ลบ"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {node.children.length > 0 && !isCollapsed && (
          <div>
            {node.children.map(child => renderMenuNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)', minHeight: '600px' }}>
      {/* Left Panel: Menu List */}
      <div style={{
        width: '280px', flexShrink: 0, background: '#fff',
        borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px', borderBottom: '1px solid #e2e8f0' }}>
          <select
            value={selectedApp}
            onChange={e => {
              setSelectedApp(e.target.value);
              setSelectedMenuId(null);
            }}
            style={{ ...inputStyle, marginTop: 0, fontWeight: 600, color: '#1e293b' }}
          >
            {activeApps.map(app => <option key={app} value={app}>{app}</option>)}
          </select>
          
          <button
            onClick={handleAddNew}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', marginTop: '12px',
              background: !selectedMenuId ? '#1e40af' : '#f1f5f9', 
              color: !selectedMenuId ? '#fff' : '#1e293b', 
              border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
          >
            <Plus size={15} /> + เพิ่มเมนูใหม่
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {treeData.map(node => renderMenuNode(node))}
          {treeData.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              ไม่พบเมนูในแอประบบนี้
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Menu Details */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              {selectedMenuId ? 'รายละเอียดข้อมูล' : 'สร้างเมนูใหม่'}
            </h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '8px',
              background: '#1e40af', color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
            }}
          >
            <Save size={15} />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px' }}>
            
            <div>
              <label style={labelStyle}>รหัสเมนู (Menu Code) <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                value={formData.menu_code || ''} 
                onChange={e => setFormData({ ...formData, menu_code: e.target.value.toLowerCase() })} 
                style={inputStyle} 
                placeholder="เช่น sys_01" 
              />
            </div>

            <div>
              <label style={labelStyle}>ประเภทเมนู (Menu Type)</label>
              <select 
                value={formData.menu_type || 'menu'} 
                onChange={e => {
                  const newType = e.target.value;
                  setFormData(prev => {
                    const newData = { ...prev, menu_type: newType };
                    if (newType === 'heading' || newType === 'submenu') {
                      newData.route = '';
                    }
                    if (newType === 'heading') {
                      newData.parent_id = null;
                    }
                    return newData;
                  });
                }} 
                style={inputStyle}
              >
                <option value="heading">Heading (หมวดหมู่หลัก)</option>
                <option value="submenu">Submenu (หมวดหมู่ย่อย)</option>
                <option value="menu">Menu (เมนูคลิกใช้งาน)</option>
              </select>
            </div>

            {formData.menu_type !== 'heading' && (
              <div>
                <label style={labelStyle}>เลือกกลุ่มแม่ (Parent Menu)</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value || null })}
                  style={inputStyle}
                >
                  <option value="">-- เลือกกลุ่มแม่ --</option>
                  {filteredMenus.filter(m => m.menu_type === 'heading' || m.menu_type === 'submenu').map(m => (
                    <option key={m.menu_id} value={m.menu_id}>{m.title} ({m.menu_type})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={labelStyle}>ตำแหน่งจัดวาง (Position)</label>
              <select
                value={positionType}
                onChange={e => setPositionType(e.target.value as any)}
                style={inputStyle}
              >
                <option value="last">สร้างต่อท้ายสุด (At the end)</option>
                <option value="before">สร้างก่อนหน้า (Before)</option>
                <option value="after">สร้างหลังจาก (After)</option>
              </select>
            </div>

            {positionType !== 'last' && (
              <div>
                <label style={labelStyle}>อ้างอิงกับเมนู (Reference Menu)</label>
                <select
                  value={referenceMenuId}
                  onChange={e => setReferenceMenuId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- เลือกเมนูอ้างอิง --</option>
                  {filteredMenus.filter(m => m.parent_id == (formData.menu_type === 'heading' ? null : formData.parent_id) && String(m.menu_id) !== String(selectedMenuId)).map(m => (
                    <option key={m.menu_id} value={m.menu_id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={labelStyle}>ชื่อเมนู (Title) <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                value={formData.title || ''} 
                onChange={e => {
                  const titleCased = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                  setFormData({ ...formData, title: titleCased });
                }} 
                style={inputStyle} 
                placeholder="เช่น Dashboard" 
              />
            </div>

            <div>
              <label style={labelStyle}>ค่าอ้างอิงหน้า (Page Key)</label>
              <input 
                value={formData.page_key || ''} 
                onChange={e => setFormData({ ...formData, page_key: e.target.value.toLowerCase() })} 
                style={inputStyle} 
                placeholder="เช่น dashboard" 
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, color: (formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? '#cbd5e1' : '#64748b' }}>
                เส้นทาง (Route/Path) {formData.menu_type === 'menu' && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <input 
                value={formData.route || ''} 
                onChange={e => setFormData({ ...formData, route: e.target.value })} 
                style={{
                  ...inputStyle,
                  backgroundColor: (formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? '#f8fafc' : '#fff',
                  cursor: (formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? 'not-allowed' : 'text',
                  borderColor: (formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? '#e2e8f0' : '#cbd5e1',
                  color: (formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? '#94a3b8' : '#000'
                }} 
                placeholder={(formData.menu_type === 'heading' || formData.menu_type === 'submenu') ? "ไม่ต้องระบุสำหรับประเภทนี้" : "เช่น /dashboard"}
                disabled={formData.menu_type === 'heading' || formData.menu_type === 'submenu'}
              />
            </div>

            <div>
              <label style={labelStyle}>ชื่อไอคอน (Icon)</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                <input 
                  value={formData.icon || ''} 
                  onChange={e => setFormData({ ...formData, icon: e.target.value })} 
                  style={{ ...inputStyle, flex: 1 }} 
                  placeholder="เช่น LayoutDashboard" 
                />
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(true)}
                  style={{
                    width: "40px",
                    background: "var(--bg-card)",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  title="เลือกไอคอน"
                >
                  {formData.icon ? renderIcon(formData.icon) : <LucideIcons.Search size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>สถานะการใช้งาน (Is Active)</label>
              <select 
                value={formData.is_active ? 'true' : 'false'} 
                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })} 
                style={inputStyle}
              >
                <option value="true">เปิดใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
              </select>
            </div>

            {/* แถวคำอธิบายภาษาต่างๆ */}
            <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>ภาษา</label>
                  </div>
                  <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>คำอธิบาย</label>
                  </div>
              </div>
              
              {languages.length > 0 ? languages.map((langItem, idx) => {
                  const langCode = langItem.languageCode || langItem.language_code || '';
                  const langLabel = langItem.description || langItem.languageName || langItem.language_name || langCode;
                  return (
                      <div key={langItem.id || idx} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                              <input 
                                  style={{...inputStyle, backgroundColor: '#f8fafc', color: '#64748b', marginTop: 0}} 
                                  value={langLabel}
                                  readOnly
                                  disabled
                              />
                          </div>
                          <div style={{ flex: 2 }}>
                              <input 
                                  style={{...inputStyle, marginTop: 0}} 
                                  value={formData.translations?.[langCode] || ''}
                                  onChange={(e) => {
                                      const newTrans = { ...(formData.translations || {}) };
                                      newTrans[langCode] = e.target.value;
                                      setFormData({...formData, translations: newTrans});
                                  }}
                                  placeholder="กรอกคำอธิบาย"
                              />
                          </div>
                      </div>
                  );
              }) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      กำลังโหลดภาษา...
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <IconPickerModal 
        isOpen={isIconModalOpen} 
        onClose={() => setIsIconModalOpen(false)} 
        selectedIcon={formData.icon} 
        onSelectIcon={(iconName) => {
          setFormData({ ...formData, icon: iconName });
          setIsIconModalOpen(false);
        }} 
      />
    </div>
  );
}

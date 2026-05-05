import React, { useState, useEffect } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons, SummaryCard } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Edit2, Eye, LayoutDashboard, Tags, Box, Trash2, Plus, Settings } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useSystemConfig } from '@nexone/ui';

interface SystemApp {
  id: number;
  app_name: string;
  desc_en: string;
  desc_th: string;
  icon_path: string;
  theme_color: string;
  status: string;
  seq_no: number;
  is_active?: boolean;
  app_group?: string;
  route_path?: string;
  api_path?: string;
  app_url?: string;
  translations?: Record<string, string>;
}

import { useApiConfig } from '../contexts/ApiConfigContext';

export default function SystemApps() {
    // ----------------- State & Initialization -----------------
    const { configs, loading: configLoading } = useSystemConfig();
    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const API_URL = `${coreApi}/v1/system-apps`;
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 20);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);
    const [data, setData] = useState<SystemApp[]>([]);
    const [languages, setLanguages] = useState<any[]>([]); // To store available languages
    
    // Listen for language changes similar to Sidebar
    const [lang, setLang] = useState<string>(
        (typeof window !== 'undefined' ? localStorage.getItem('nexone_lang') || 'th' : 'th').toLowerCase()
    );

    useEffect(() => {
        if (!configLoading && configs.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs.pageRecordDefault, hasSetDefaultPageSize]);

    useEffect(() => {
        const handleLangChange = (e: any) => {
            if (e.detail) {
                const newLang = e.detail.code || e.detail.lang;
                if (newLang) setLang(newLang.toLowerCase());
            }
        };
        window.addEventListener('nexone:lang_changed', handleLangChange);
        return () => window.removeEventListener('nexone:lang_changed', handleLangChange);
    }, []);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'>('view');
    const [selectedItem, setSelectedItem] = useState<SystemApp | null>(null);
    const [formData, setFormData] = useState<Partial<SystemApp & { translations?: Record<string, string> }>>({
        app_name: '', desc_en: '', desc_th: '', icon_path: '', theme_color: '', status: 'active', seq_no: 1, app_group: '', route_path: '', api_path: '', app_url: '', translations: {}
    });

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, isError: boolean}>({isOpen: false, message: '', isError: false});

    // Column Settings State
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        seq_no: true,
        icon: true,
        app_name: true,
        app_group: true,
        desc: true,
        status: true
    });
    const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'|'none'}>({ key: 'seq_no', direction: 'asc' });

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}?all=true`, { credentials: 'include' });
            const json = await res.json();
            const apps = (json && json.data !== undefined) ? json.data : json;
            if (Array.isArray(apps)) {
                // sort by seq_no
                apps.sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0));
                setData(apps);
            }
        } catch (error) {
            console.error('Failed to fetch system apps:', error);
        }
    };

    const fetchLanguages = async () => {
        try {
            const res = await fetch(`${coreApi}/translations/languages`, { credentials: 'include' });
            const json = await res.json();
            const langs = (json && json.data !== undefined) ? json.data : json;
            if (Array.isArray(langs)) {
                setLanguages(langs);
            }
        } catch (error) {
            console.error('Failed to fetch languages:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchLanguages();
    }, [coreApi]);

    const handleEdit = (item: SystemApp) => {
        setFormData({ 
            ...item, 
            desc_th: (item as any).translations?.th || item.desc_th,
            desc_en: (item as any).translations?.en || item.desc_en,
        });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: SystemApp) => {
        setFormData({ 
            ...item,
            desc_th: (item as any).translations?.th || item.desc_th,
            desc_en: (item as any).translations?.en || item.desc_en,
        });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.app_name?.trim()) return;
        
        try {
            if (modalMode === 'add') {
                const res = await fetch(API_URL, { credentials: 'include', 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (res.ok) {
                    fetchData();
                    setIsModalOpen(false);
                    setAlertConfig({isOpen: true, message: 'เพิ่มข้อมูลเรียบร้อยแล้ว', isError: false});
                } else {
                    const errorJson = await res.json().catch(()=>({}));
                    setAlertConfig({isOpen: true, message: errorJson.details || errorJson.error || 'เพิ่มข้อมูลไม่สำเร็จ', isError: true});
                }
            } else if (modalMode === 'edit' && selectedItem) {
                const res = await fetch(`${API_URL}/${selectedItem.id}`, { credentials: 'include', 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (res.ok) {
                    fetchData();
                    setIsModalOpen(false);
                    setAlertConfig({isOpen: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false});
                } else {
                    const errorJson = await res.json().catch(()=>({}));
                    setAlertConfig({isOpen: true, message: errorJson.details || errorJson.error || 'บันทึกข้อมูลไม่สำเร็จ', isError: true});
                }
            } 
        } catch (error) {
            console.error('Save error:', error);
            setAlertConfig({isOpen: true, message: 'บันทึก/เพิ่มข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ', isError: true});
        }
    };

    const handleDelete = async (item: SystemApp) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบแอป "${item.app_name}"?`)) {
            try {
                const res = await fetch(`${API_URL}/${item.id}`, { credentials: 'include', 
                    method: 'DELETE',
                });
                if (res.ok) {
                    fetchData();
                    setAlertConfig({isOpen: true, message: 'ลบข้อมูลเรียบร้อยแล้ว', isError: false});
                } else {
                    const errorJson = await res.json().catch(()=>({}));
                    setAlertConfig({isOpen: true, message: errorJson.details || errorJson.error || 'ลบข้อมูลไม่สำเร็จ', isError: true});
                }
            } catch (error) {
                console.error('Delete error:', error);
                setAlertConfig({isOpen: true, message: 'ลบข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ', isError: true});
            }
        }
    };
    
    // กรองข้อมูลตามคำค้นหา
    const searchLower = search.toLowerCase();
    const baseData = data.filter(item => 
        !searchLower || 
        (item.app_name || '').toLowerCase().includes(searchLower) || 
        (item.desc_th || '').toLowerCase().includes(searchLower) ||
        (item.app_group || '').toLowerCase().includes(searchLower)
    );

    // ดึงรายการหมวดหมู่ทั้งหมดที่ไม่ซ้ำกัน
    const uniqueCategories = Array.from(new Set(data.map(item => item.app_group || 'ไม่ระบุหมวดหมู่')));

    // กรองข้อมูลตามแท็บด้านบน (Summary Cards)
    const filteredData = baseData.filter(item => {
        if (filterType === 'all') return true;
        return (item.app_group || 'ไม่ระบุหมวดหมู่') === filterType;
    });

    // ฟังก์ชันจัดการการเรียงลำดับเมื่อคลิกที่หัวตาราง
    const handleSort = (key: keyof SystemApp) => {
        if (sortConfig.key === key && sortConfig.direction !== 'none') {
            setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            setSortConfig({ key, direction: 'asc' });
        }
    };

    // ฟังก์ชันสำหรับแสดงไอคอนเรียงลำดับ
    const renderSortIcon = (key: keyof SystemApp) => {
        if (sortConfig.key !== key || sortConfig.direction === 'none') {
            // แสดงไอคอนสีเทาเมื่อไม่ได้เป็นคอลัมน์ที่กำลังเรียงอยู่
            return <span style={{ marginLeft: '4px', fontSize: '12px', color: '#cbd5e1' }}>↕</span>;
        }
        // ลูกศรลง = เรียงจากน้อยไปมาก (asc), ลูกศรขึ้น = เรียงจากมากไปน้อย (desc)
        return sortConfig.direction === 'asc' 
            ? <span style={{ marginLeft: '4px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>↓</span> 
            : <span style={{ marginLeft: '4px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>↑</span>;
    };

    // เรียงลำดับข้อมูล
    let sortedData = [...filteredData];
    if (sortConfig && sortConfig.direction !== 'none') {
        sortedData.sort((a, b) => {
            let aVal = (a as any)[sortConfig.key];
            let bVal = (b as any)[sortConfig.key];
            
            if (aVal === undefined || aVal === null) aVal = '';
            if (bVal === undefined || bVal === null) bVal = '';

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // คำนวณข้อมูลที่จะนำมาแสดงในตาราง
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout

            // แถบซ้าย - ปุ่ม Export
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'SystemApps', [
                        { key: 'id', label: 'ID' },
                        { key: 'app_name', label: 'App Name' },
                        { key: 'app_group', label: 'Group' },
                        { key: 'desc_th', label: 'Description' },
                        { key: 'status', label: 'Status' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'SystemApps', [
                        { key: 'id', label: 'ID' },
                        { key: 'app_name', label: 'App Name' },
                        { key: 'app_group', label: 'Group' },
                        { key: 'desc_th', label: 'Description' },
                        { key: 'status', label: 'Status' }
                    ])}
                    onExportPDF={(orientation) => exportToPDF(filteredData, 'SystemApps', [
                        { key: 'id', label: 'ID' },
                        { key: 'app_name', label: 'App Name' },
                        { key: 'app_group', label: 'Group' },
                        { key: 'desc_th', label: 'Description' },
                        { key: 'status', label: 'Status' }
                    ], 'System Apps Report', orientation)}
                />
            }

            // แถบขวา - การค้นหา
            toolbarRight={
                <div style={{ display: 'flex', gap: '8px' }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาแอปในระบบ..." />
                    <button 
                        onClick={() => {
                            setFormData({ app_name: '', desc_en: '', desc_th: '', icon_path: '', theme_color: '', status: 'active', seq_no: 1, app_group: '', route_path: '', api_path: '', app_url: '' });
                            setSelectedItem(null);
                            setModalMode('add');
                            setIsModalOpen(true);
                        }}
                        style={crudStyles.primaryBtn}
                    >
                        <Plus size={16} />
                        เพิ่มข้อมูล
                    </button>
                </div>
            }
        >
            {/* ตารางข้อมูล - Template 1 */}
            <div style={{ height: "720px", overflowY: "auto" }}>
                <table className="data-table">
                    <thead>
                        <tr>
                        {visibleColumns.seq_no && <th style={{ width: '60px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('seq_no')}>No. {renderSortIcon('seq_no')}</th>}
                        {visibleColumns.icon && <th style={{ width: '60px' }}>Icon</th>}
                        {visibleColumns.app_name && <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('app_name')}>ชื่อแอป (App Name) {renderSortIcon('app_name')}</th>}
                        {visibleColumns.app_group && <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('app_group')}>กลุ่ม (Group) {renderSortIcon('app_group')}</th>}
                        {visibleColumns.desc && <th>คำอธิบาย</th>}
                        {visibleColumns.status && <th className="text-center" style={{ width: '120px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>สถานะ {renderSortIcon('status')}</th>}
                        <th className="text-center" style={{ width: '120px', paddingRight: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <span>จัดการ</span>
                                <span title="ตั้งค่าคอลัมน์" style={{ display: 'flex', alignItems: 'center' }}>
                                    <Settings size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsColumnSettingsOpen(true)} />
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id}>
                            {visibleColumns.seq_no && <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}>{item.seq_no}</td>}
                            {visibleColumns.icon && <td>
                                {item.icon_path && (
                                    <img src={item.icon_path} alt={item.app_name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                )}
                            </td>}
                            {visibleColumns.app_name && <td><span className="font-medium" style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>{item.app_name}</span></td>}
                            {visibleColumns.app_group && <td><span className="text-sm px-2 py-1 bg-slate-100 rounded-md border border-slate-200">{item.app_group || '-'}</span></td>}
                            {visibleColumns.desc && <td className="text-muted text-sm">
                                {((item as any).translations && (item as any).translations[lang]) || 
                                 (lang === 'th' ? item.desc_th : item.desc_en) || 
                                 item.desc_th}
                            </td>}
                            {visibleColumns.status && <td className="text-center">
                                <StatusDropdown 
                                    status={item.status === 'active' || item.is_active || false} 
                                    onChange={async (val) => {
                                        try {
                                            const updatedItem = { ...item, status: val ? 'active' : 'inactive', is_active: val };
                                            const res = await fetch(`${API_URL}/${item.id}`, { credentials: 'include', 
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(updatedItem)
                                            });
                                            if (res.ok) {
                                                fetchData();
                                            } else {
                                                setAlertConfig({isOpen: true, message: 'เปลี่ยนสถานะไม่สำเร็จ', isError: true});
                                            }
                                        } catch(e) { console.error(e); }
                                    }} 
                                />
                            </td>}
                            <td className="text-center" style={{ paddingRight: '24px' }}>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                    <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู">
                                        <Eye size={14} />
                                    </button>
                                    <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                ไม่พบข้อมูล
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* Modal Components */}
            <BaseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'edit' ? 'แก้ไขข้อมูลแอป' : 'รายละเอียดแอป'}
                width="750px"
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: formData.app_name?.trim() ? 1 : 0.5 }} disabled={!formData.app_name?.trim()}>บันทึกข้อมูล</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                {/* แถว 1: App Name | Icon Path */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อแอป (App Name) <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="ระบุชื่อแอปพลิเคชัน"
                            value={formData.app_name || ''}
                            onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>พาธไอคอน (Icon Path)</label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="เช่น /apps/icon.png"
                            value={formData.icon_path || ''}
                            onChange={(e) => setFormData({...formData, icon_path: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                </div>

                {/* แถว 2: Group | Seq No */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                        <label style={crudStyles.label}>กลุ่ม (App Group)</label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="เช่น Admin, Operations"
                            value={formData.app_group || ''}
                            onChange={(e) => setFormData({...formData, app_group: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ลำดับ (Seq No)</label>
                        <input 
                            type="number" 
                            style={crudStyles.input} 
                            value={formData.seq_no || ''}
                            onChange={(e) => setFormData({...formData, seq_no: Number(e.target.value)})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                </div>

                {/* แถว 3: Frontend URL | API URL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                        <label style={crudStyles.label}>URL ปลายทาง (Frontend)</label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="http://localhost:3101"
                            value={formData.route_path || formData.app_url || ''}
                            onChange={(e) => setFormData({...formData, route_path: e.target.value, app_url: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>API Base URL (Backend)</label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="http://localhost:8101/api/v1"
                            value={formData.api_path || ''}
                            onChange={(e) => setFormData({...formData, api_path: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                </div>

                {/* แถวคำอธิบายภาษาต่างๆ (Dynamic Table-like) */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
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
                                        style={{...crudStyles.input, backgroundColor: '#f8fafc', color: '#64748b'}} 
                                        value={langLabel}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <input 
                                        style={crudStyles.input} 
                                        value={formData.translations?.[langCode] || ''}
                                        onChange={(e) => {
                                            const newTrans = { ...formData.translations };
                                            newTrans[langCode] = e.target.value;
                                            setFormData({...formData, translations: newTrans});
                                        }}
                                        disabled={modalMode === 'view'}
                                        placeholder="กรอกคำอธิบาย"
                                    />
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            กำลังโหลดภาษา...
                        </div>
                    )}
                </div>

                {/* สถานะ */}
                {modalMode === 'view' && (
                    <div>
                        <label style={crudStyles.label}>สถานะการใช้งาน</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <StatusDropdown 
                                status={formData.status === 'active' || formData.is_active || false} 
                                disabled={true}
                                onChange={(val) => {}} 
                            />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>
                        </div>
                    </div>
                )}
            </BaseModal>

            {/* Custom Alert Modal */}
            <BaseModal 
                isOpen={alertConfig.isOpen} 
                onClose={() => setAlertConfig({...alertConfig, isOpen: false})}
                title={alertConfig.isError ? "แจ้งเตือนข้อผิดพลาด" : "สำเร็จ"}
                width="400px"
                footer={
                    <button onClick={() => setAlertConfig({...alertConfig, isOpen: false})} style={{ padding: '8px 16px', background: alertConfig.isError ? '#ef4444' : 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, width: '100px' }}>ตกลง</button>
                }
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>{alertConfig.message}</p>
                </div>
            </BaseModal>

            {/* Column Settings Modal */}
            <BaseModal 
                isOpen={isColumnSettingsOpen} 
                onClose={() => setIsColumnSettingsOpen(false)}
                title="ตั้งค่าการแสดงผลตาราง"
                width="450px"
                footer={
                    <button onClick={() => setIsColumnSettingsOpen(false)} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ตกลง</button>
                }
            >
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>เลือกคอลัมน์ที่ต้องการแสดง</h4>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, width: '130px' }}>เรียงลำดับข้อมูล</h4>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* No. */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.seq_no} onChange={(e) => setVisibleColumns({...visibleColumns, seq_no: e.target.checked})} /> No.
                            </label>
                            <select 
                                style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0}}
                                value={sortConfig.key === 'seq_no' && sortConfig.direction !== 'none' ? 'asc' : 'none'}
                                onChange={(e) => setSortConfig({ key: 'seq_no', direction: e.target.value as 'asc'|'none' })}
                            >
                                <option value="none">ไม่เรียง</option>
                                <option value="asc">เรียง</option>
                            </select>
                        </div>

                        {/* Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.icon} onChange={(e) => setVisibleColumns({...visibleColumns, icon: e.target.checked})} /> Icon
                            </label>
                            <select disabled style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0, opacity: 0.5}}>
                                <option value="none">ไม่เรียง</option>
                            </select>
                        </div>

                        {/* ชื่อแอป */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.app_name} onChange={(e) => setVisibleColumns({...visibleColumns, app_name: e.target.checked})} /> ชื่อแอป
                            </label>
                            <select 
                                style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0}}
                                value={sortConfig.key === 'app_name' && sortConfig.direction !== 'none' ? 'asc' : 'none'}
                                onChange={(e) => setSortConfig({ key: 'app_name', direction: e.target.value as 'asc'|'none' })}
                            >
                                <option value="none">ไม่เรียง</option>
                                <option value="asc">เรียง</option>
                            </select>
                        </div>

                        {/* กลุ่ม */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.app_group} onChange={(e) => setVisibleColumns({...visibleColumns, app_group: e.target.checked})} /> กลุ่ม
                            </label>
                            <select 
                                style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0}}
                                value={sortConfig.key === 'app_group' && sortConfig.direction !== 'none' ? 'asc' : 'none'}
                                onChange={(e) => setSortConfig({ key: 'app_group', direction: e.target.value as 'asc'|'none' })}
                            >
                                <option value="none">ไม่เรียง</option>
                                <option value="asc">เรียง</option>
                            </select>
                        </div>

                        {/* คำอธิบาย */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.desc} onChange={(e) => setVisibleColumns({...visibleColumns, desc: e.target.checked})} /> คำอธิบาย
                            </label>
                            <select disabled style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0, opacity: 0.5}}>
                                <option value="none">ไม่เรียง</option>
                            </select>
                        </div>

                        {/* สถานะ */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.status} onChange={(e) => setVisibleColumns({...visibleColumns, status: e.target.checked})} /> สถานะ
                            </label>
                            <select 
                                style={{...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0}}
                                value={sortConfig.key === 'status' && sortConfig.direction !== 'none' ? 'asc' : 'none'}
                                onChange={(e) => setSortConfig({ key: 'status', direction: e.target.value as 'asc'|'none' })}
                            >
                                <option value="none">ไม่เรียง</option>
                                <option value="asc">เรียง</option>
                            </select>
                        </div>
                    </div>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}


import React, { useState, useEffect } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal, ExportButtons, StatusDropdown } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Eye, Globe2, Tag, Hash, Type, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useApiConfig } from '../contexts/ApiConfigContext';

interface FlatTranslation {
    id: number;
    pageKey: string;
    labelKey: string;
    languageCode: string;
    labelValue: string;
    is_active: boolean;
}

export default function SystemMenuLanguages() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [translations, setTranslations] = useState<FlatTranslation[]>([]);
    
    const [languages, setLanguages] = useState<any[]>([]);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('edit');
    const [selectedItem, setSelectedItem] = useState<FlatTranslation | null>(null);
    const [formData, setFormData] = useState<Partial<FlatTranslation>>({ pageKey: '', labelKey: '', languageCode: 'en', labelValue: '', is_active: true });
    
    // Add Language Form State
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [langForm, setLangForm] = useState({ languageCode: '', languageName: '', description: '' });

    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', 'http://localhost:8001/api');
    const API_URL = `${coreApi}/translations`;

    const fetchTranslations = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data && Array.isArray(data)) {
                // Flatten the grouped response
                const flatData: FlatTranslation[] = [];
                data.forEach(group => {
                    if (group.values) {
                        for (const [lang, valObj] of Object.entries(group.values) as any) {
                            flatData.push({
                                id: valObj.id,
                                pageKey: group.pageKey,
                                labelKey: group.labelKey,
                                languageCode: lang,
                                labelValue: valObj.value,
                                is_active: valObj.isActive !== false // defaults to true
                            });
                        }
                    }
                });
                flatData.sort((a,b) => {
                    if(a.pageKey === b.pageKey) {
                        if(a.labelKey === b.labelKey) return a.languageCode.localeCompare(b.languageCode);
                        return a.labelKey.localeCompare(b.labelKey);
                    }
                    return a.pageKey.localeCompare(b.pageKey);
                });
                setTranslations(flatData);
            }
        } catch (error) {
            console.error('Error fetching translations:', error);
        }
    };

    const fetchLanguages = async () => {
        try {
            const res = await fetch(`${API_URL}/languages`);
            const data = await res.json();
            if (Array.isArray(data)) setLanguages(data);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    useEffect(() => {
        fetchTranslations();
        fetchLanguages();
    }, []);

    const handleAdd = () => {
        setFormData({ pageKey: '', labelKey: '', languageCode: 'en', labelValue: '', is_active: true });
        setSelectedItem(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: FlatTranslation) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: FlatTranslation) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: FlatTranslation) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            const res = await fetch(`${API_URL}/id/${selectedItem.id}`, { method: 'DELETE' });
            if (res.ok) {
                setIsModalOpen(false);
                fetchTranslations();
            }
        } catch (error) {
            console.error('Error deleting translation:', error);
        }
    };

    const saveForm = async () => {
        try {
            if (modalMode === 'add') {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        labelKey: formData.labelKey, 
                        pageKey: formData.pageKey, 
                        values: { [formData.languageCode || 'en']: formData.labelValue } 
                    })
                });
                if (res.ok) {
                    setIsModalOpen(false);
                    fetchTranslations();
                }
            } else if (selectedItem) {
                const res = await fetch(`${API_URL}/${selectedItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ labelValue: formData.labelValue, is_active: formData.is_active })
                });
                if (res.ok) {
                    setIsModalOpen(false);
                    fetchTranslations();
                }
            }
        } catch (error) {
            console.error('Error saving translation:', error);
        }
    };

    const handleSaveNewLanguage = async () => {
        if (!langForm.languageCode || !langForm.languageName) return;
        try {
            const res = await fetch(`${API_URL}/languages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    languageCode: langForm.languageCode.toLowerCase(),
                    languageName: langForm.languageName,
                    description: langForm.description || langForm.languageName
                })
            });
            if (res.ok) {
                setIsLangModalOpen(false);
                fetchLanguages();
                // Select it
                setFormData(prev => ({ ...prev, languageCode: langForm.languageCode.toLowerCase() }));
                setLangForm({ languageCode: '', languageName: '', description: '' });
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add language');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter
    const searchLower = search.toLowerCase();
    const filteredData = translations.filter(item => 
        !searchLower || 
        item.pageKey.toLowerCase().includes(searchLower) || 
        item.labelKey.toLowerCase().includes(searchLower) ||
        item.labelValue.toLowerCase().includes(searchLower)
    );

    // Pagination
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'MenusLanguages', [
                        { key: "id", label: "ID" },
                        { key: "pageKey", label: "คีย์หน้า (PAGE KEY)" },
                        { key: "labelKey", label: "คีย์ป้ายกำกับ (LABEL KEY)" },
                        { key: "labelValue", label: "ค่าหน้าจอ (TRANSLATION)" },
                        { key: "languageCode", label: "ภาษา (LANG)" },
                        { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'MenusLanguages', [
                        { key: "id", label: "ID" },
                        { key: "pageKey", label: "คีย์หน้า (PAGE KEY)" },
                        { key: "labelKey", label: "คีย์ป้ายกำกับ (LABEL KEY)" },
                        { key: "labelValue", label: "ค่าหน้าจอ (TRANSLATION)" },
                        { key: "languageCode", label: "ภาษา (LANG)" },
                        { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'MenusLanguages', [
                        { key: "id", label: "ID" },
                        { key: "pageKey", label: "คีย์หน้า (PAGE KEY)" },
                        { key: "labelKey", label: "คีย์ป้ายกำกับ (LABEL KEY)" },
                        { key: "labelValue", label: "ค่าหน้าจอ (TRANSLATION)" },
                        { key: "languageCode", label: "ภาษา (LANG)" },
                        { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
                    ], 'Menus Languages Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาคีย์หน้า, คีย์ป้ายกำกับ..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}>
                        <Plus size={16} /> 
                        <span>สร้างภาษาเมนูใหม่</span>
                    </button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px', textAlign: 'center' }}>ลำดับ</th>
                            <th>คีย์หน้า (PAGE KEY)</th>
                            <th>คีย์ป้ายกำกับ (LABEL KEY)</th>
                            <th>ค่าหน้าจอ (TRANSLATION)</th>
                            <th style={{ width: '120px' }}>ภาษา (LANG)</th>
                            <th className="text-center" style={{ width: '120px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                        <Hash size={12} style={{ opacity: 0.7 }} /> {item.pageKey}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ minWidth: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Tag size={14} />
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{item.labelKey}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Type size={14} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                            {item.labelValue}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Globe2 size={14} color="var(--text-muted)" />
                                        <span className={`px-2 py-0.5 border rounded-md text-[11px] font-bold tracking-wide uppercase ${item.languageCode === 'en' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                            {item.languageCode}
                                        </span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <StatusDropdown 
                                        status={item.is_active} 
                                        onChange={async (val) => {
                                            try {
                                                await fetch(`${API_URL}/${item.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ is_active: val })
                                                });
                                                fetchTranslations();
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }} 
                                    />
                                </td>
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {translations.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    ไม่พบข้อมูลภาษาเมนู
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มภาษาเมนูใหม่' : modalMode === 'edit' ? 'แก้ไขภาษาเมนู' : 'รายละเอียดภาษาเมนู'}
                width="600px"
                footer={
                    modalMode !== 'view' ? (
                        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end', paddingTop: '16px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 24px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>{modalMode === 'add' ? 'บันทึกข้อมูล' : 'บันทึกการแก้ไข'}</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={crudStyles.label}>คีย์หน้า (Page Key)</label>
                            <input type="text" style={crudStyles.input} value={formData.pageKey || ''} onChange={(e) => setFormData({...formData, pageKey: e.target.value})} disabled={modalMode !== 'add'} placeholder="เช่น common" />
                        </div>
                        <div>
                            <label style={{ ...crudStyles.label, display: 'flex', justifyContent: 'space-between' }}>
                                ภาษา (Language)
                                {modalMode !== 'view' && (
                                    <button type="button" onClick={() => setIsLangModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                                        + เพิ่มภาษา
                                    </button>
                                )}
                            </label>
                            <select 
                                style={{ ...crudStyles.input, appearance: 'auto', paddingRight: '12px' }} 
                                value={formData.languageCode || ''} 
                                onChange={(e) => setFormData({...formData, languageCode: e.target.value})} 
                                disabled={modalMode === 'view'}
                            >

                                {languages.map(l => (
                                    <option key={l.id} value={l.languageCode}>{l.languageName} ({l.languageCode.toUpperCase()})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={crudStyles.label}>คีย์ป้ายกำกับ (Label Key)</label>
                        <input type="text" style={crudStyles.input} value={formData.labelKey || ''} onChange={(e) => setFormData({...formData, labelKey: e.target.value})} disabled={modalMode !== 'add'} placeholder="เช่น common.loading" />
                    </div>
                        
                    <div>
                        <label style={{ ...crudStyles.label, display: 'block', marginBottom: '8px' }}>ค่าการแสดงผล (Value / Translation) <span style={{color:'red'}}>*</span></label>
                        <textarea 
                            style={{ ...crudStyles.input, minHeight: '120px', resize: 'vertical' }} 
                            value={formData.labelValue || ''} 
                            onChange={(e) => setFormData({...formData, labelValue: e.target.value})} 
                            disabled={modalMode === 'view'} 
                            placeholder="ระบุข้อความแปลภาษา..." 
                        />
                    </div>
                </div>
            </BaseModal>

            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบภาษา"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบคำแปล <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.labelKey} ({selectedItem?.languageCode})</strong>?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>

            {/* Modal for adding a new language to the system */}
            <BaseModal
                isOpen={isLangModalOpen}
                onClose={() => setIsLangModalOpen(false)}
                title="เพิ่มภาษาใหม่ (Add New Language)"
                width="400px"
                footer={
                    <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsLangModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>ยกเลิก</button>
                        <button onClick={handleSaveNewLanguage} style={{ padding: '8px 16px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>บันทึกภาษา</button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>รหัสภาษา (Language Code) <span style={{color:'red'}}>*</span></label>
                        <input type="text" style={crudStyles.input} value={langForm.languageCode} onChange={e => setLangForm({...langForm, languageCode: e.target.value})} placeholder="เช่น: th, en, ja, cn" />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ชื่อภาษา (Language Name) <span style={{color:'red'}}>*</span></label>
                        <input type="text" style={crudStyles.input} value={langForm.languageName} onChange={e => setLangForm({...langForm, languageName: e.target.value})} placeholder="เช่น: Thai, English" />
                    </div>
                    <div>
                        <label style={crudStyles.label}>คำอธิบาย (Description)</label>
                        <input type="text" style={crudStyles.input} value={langForm.description} onChange={e => setLangForm({...langForm, description: e.target.value})} placeholder="เช่น: ภาษาไทย, ภาษาอังกฤษ" />
                    </div>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

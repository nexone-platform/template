import React, { useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { usePagePermission } from '@/contexts/PermissionContext';

interface Province {
  id: string;
  code: string;
  nameTH: string;
  region: string;
  status: boolean;
}

export default function ProvincesSettings() {
    const perm = usePagePermission('Provinces / Areas');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Fetch data from API
    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', 'http://localhost:8001/api');
    const API_URL = `${coreApi}/provinces`;

    const fetchProvinces = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const json = await res.json();
                const formattedList = json.map((p: any) => ({
                    id: String(p.province_id),
                    code: p.abbr || '',
                    nameTH: p.province_name || '',
                    region: p.region || '',
                    status: p.is_active ?? true
                }));
                setData(formattedList);
            }
        } catch (e) {
            console.error('Failed to fetch provinces', e);
            setData([]);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchProvinces();
    }, []);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Province | null>(null);
    const [formData, setFormData] = useState<Partial<Province>>({ code: '', nameTH: '', region: '', status: true });
    const [saving, setSaving] = useState(false);

    // Action Handlers
    const handleAdd = () => {
        setFormData({ code: '', nameTH: '', region: '', status: true });
        setModalMode('add');
        setIsModalOpen(true);
    };
    const handleView = (item: Province) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };
    const handleEdit = (item: Province) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleDelete = (item: Province) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.nameTH?.trim()) return;
        setSaving(true);
        const payload = {
            province_name: formData.nameTH,
            abbr: formData.code,
            region: formData.region,
        };

        try {
            if (modalMode === 'add') {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else if (modalMode === 'edit' && selectedItem) {
                await fetch(`${API_URL}/${selectedItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            setIsModalOpen(false);
            await fetchProvinces();
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            await fetch(`${API_URL}/${selectedItem.id}`, { method: 'DELETE' });
            setIsModalOpen(false);
            await fetchProvinces();
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const handleToggleStatus = (item: Province, val: boolean) => {
        setData(prev => prev.map(d => d.id === item.id ? { ...d, status: val } : d));
    };

    // Filter
    const searchLower = search.toLowerCase();
    const filteredData = data.filter(item => 
        !searchLower || 
        item.nameTH.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) ||
        item.region.toLowerCase().includes(searchLower)
    );

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Export columns
    const exportColumns = [
        { key: 'code', label: 'รหัส (Code)' },
        { key: 'nameTH', label: 'ชื่อภาษาไทย' },
        { key: 'region', label: 'ภูมิภาค' },
        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            toolbarLeft={
                perm.canExport ? (
                <ExportButtons
                    onExportXLSX={() => exportToXLSX(filteredData, 'Provinces', exportColumns)}
                    onExportCSV={() => exportToCSV(filteredData, 'Provinces', exportColumns)}
                    onExportPDF={() => exportToPDF(filteredData, 'Provinces', exportColumns, 'Provinces Report - NexCore')}
                />
                ) : undefined
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาจังหวัด..." />}
                    {perm.canAdd  && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มจังหวัด</span></button>}
                </>
            }
        >
            {/* hasActions: ถ้าไม่มีสิทธิ์ใดเลย ซ่อน column จัดการ */}
            {(() => {
            const hasActions = perm.canView || perm.canEdit || perm.canDelete;
            return (
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>รหัส (Code)</th>
                            <th>ชื่อภาษาไทย</th>
                            <th>ภูมิภาค</th>
                            <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                            {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.id}>
                                <td><span className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}>{item.code}</span></td>
                                <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.nameTH}</span></td>
                                <td className="text-muted">{item.region}</td>
                                <td className="text-center">
                                    <StatusDropdown status={item.status} onChange={(val) => handleToggleStatus(item, val)} disabled={!perm.canEdit} />
                                </td>
                                {hasActions && (
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        {perm.canView   && <button onClick={() => handleView(item)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู"><Eye    size={14} /></button>}
                                        {perm.canEdit   && <button onClick={() => handleEdit(item)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข"><Edit2  size={14} /></button>}
                                        {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ"><Trash2 size={14} /></button>}
                                    </div>
                                </td>
                                )}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan={hasActions ? 5 : 4} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>ไม่พบข้อมูล</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            );
            })()}

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* Modal Add/Edit/View */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มจังหวัดใหม่' : modalMode === 'edit' ? 'แก้ไขจังหวัด' : 'รายละเอียดจังหวัด'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} disabled={!formData.nameTH?.trim() || saving}
                                style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.nameTH?.trim() && !saving) ? 1 : 0.5 }}>
                                {saving ? 'กำลังบันทึก...' : modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>รหัสจังหวัด (Code)</label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุรหัสจังหวัด"
                            value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value})}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ชื่อภาษาไทย <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อจังหวัดภาษาไทย"
                            value={formData.nameTH || ''} onChange={(e) => setFormData({...formData, nameTH: e.target.value})}
                            disabled={modalMode === 'view'} />
                    </div>

                    <div>
                        <label style={crudStyles.label}>ภูมิภาค</label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุภูมิภาค"
                            value={formData.region || ''} onChange={(e) => setFormData({...formData, region: e.target.value})}
                            disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.status ?? true}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, status: val }); }}
                                    disabled={modalMode === 'view'} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Confirm Modal */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? 'กำลังลบ...' : 'ลบข้อมูล'}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.nameTH}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

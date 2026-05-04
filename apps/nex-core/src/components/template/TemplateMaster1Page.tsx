import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons, ImportExcelButton } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Info, Trash2, Eye, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { templateApi, Template } from '@/services/api';
import { usePagePermission } from '@/contexts/PermissionContext';
import { useSystemConfig } from '@nexone/ui';

export default function TemplateMaster1Page() {
    const perm = usePagePermission('Master Type 1');
    const [data, setData] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const { configs, loading: configLoading } = useSystemConfig();
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Template | null>(null);
    const [formData, setFormData] = useState({ template_name: '', template_desc: '', is_active: true });
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(() => {
        setLoading(true);
        templateApi.getAll()
            .then(res => { setData(res || []); })
            .catch(err => { console.error('Failed to load templates:', err); setData([]); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Action Handlers
    const handleAdd = () => {
        setFormData({ template_name: '', template_desc: '', is_active: true });
        setModalMode('add');
        setIsModalOpen(true);
    };
    const handleEdit = (item: Template) => {
        setFormData({ template_name: item.template_name, template_desc: item.template_desc || '', is_active: item.is_active });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleView = (item: Template) => {
        setFormData({ template_name: item.template_name, template_desc: item.template_desc || '', is_active: item.is_active });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };
    const handleDelete = (item: Template) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.template_name.trim()) return;
        setSaving(true);
        try {
            if (modalMode === 'add') {
                await templateApi.create({ template_name: formData.template_name, template_desc: formData.template_desc, is_active: formData.is_active });
            } else if (modalMode === 'edit' && selectedItem) {
                await templateApi.update(selectedItem.template_id, { template_name: formData.template_name, template_desc: formData.template_desc, is_active: formData.is_active });
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            await templateApi.remove(selectedItem.template_id);
            setIsModalOpen(false);
            loadData();
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const handleToggleStatus = async (item: Template, val: boolean) => {
        try {
            await templateApi.toggleStatus(item.template_id, val);
            setData(prev => prev.map(d => d.template_id === item.template_id ? { ...d, is_active: val } : d));
        } catch (err) { console.error(err); }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = null;
            else direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const searchLower = search.toLowerCase();
    const filteredData = data.filter(item =>
        !searchLower ||
        item.template_name.toLowerCase().includes(searchLower) ||
        (item.template_desc || '').toLowerCase().includes(searchLower)
    );

    let sortedData = [...filteredData];
    if (sortConfig.key && sortConfig.direction !== null) {
        sortedData.sort((a, b) => {
            const aVal = (a as any)[sortConfig.key];
            const bVal = (b as any)[sortConfig.key];
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey || sortConfig.direction === null) {
            return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowDown size={14} />;
        }
        return <ArrowUp size={14} />;
    };

    const renderTh = (label: string, columnKey: string, width?: string) => (
        <th 
            style={{ width, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }} 
            onClick={() => handleSort(columnKey)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span>{label}</span>
                {renderSortIcon(columnKey)}
            </div>
        </th>
    );

        const handleImport = async (data: any[]) => {
        setSaving(true);
        try {
            for (const item of data) {
                if (item['ชื่อข้อมูล']) {
                    await templateApi.create({
                        template_name: item['ชื่อข้อมูล'],
                        template_desc: item['คำอธิบาย'] || '',
                        is_active: item['สถานะ'] !== 'ยกเลิก'
                    });
                }
            }
            loadData();
        } catch (err) {
            console.error('Import failed:', err);
        }
        setSaving(false);
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            toolbarLeft={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {perm.canExport && (
                    <ExportButtons
                        onExportXLSX={() => exportToXLSX(filteredData, 'Template1', [
                            { key: 'template_id', label: 'ID' },
                            { key: 'template_name', label: 'ชื่อข้อมูล' },
                            { key: 'template_desc', label: 'คำอธิบาย' },
                            { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                        ])}
                        onExportCSV={() => exportToCSV(filteredData, 'Template1', [
                            { key: 'template_id', label: 'ID' },
                            { key: 'template_name', label: 'ชื่อข้อมูล' },
                            { key: 'template_desc', label: 'คำอธิบาย' },
                            { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                        ])}
                        onExportPDF={() => exportToPDF(filteredData, 'Template1', [
                            { key: 'template_id', label: 'ID' },
                            { key: 'template_name', label: 'ชื่อข้อมูล' },
                            { key: 'template_desc', label: 'คำอธิบาย' },
                            { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                        ], 'Template 1 Report')}
                    />
                    )}
                    {perm.canAdd && (
                    <ImportExcelButton 
                        onImport={handleImport}
                        expectedColumns={['ชื่อข้อมูล', 'คำอธิบาย', 'สถานะ']}
                        isLoading={saving}
                    />
                )}
                </div>
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="ค้นหาตัวอย่าง..." />}
                    {perm.canAdd  && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>}
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
                            {renderTh('ID', 'template_id', '60px')}
                            {renderTh('ชื่อข้อมูล', 'template_name')}
                            {renderTh('คำอธิบาย', 'template_desc')}
                            {renderTh('สถานะ', 'is_active', '100px')}
                            {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '24px', whiteSpace: 'nowrap' }}>จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.template_id}>
                                <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {item.template_id}</td>
                                <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.template_name}</span></td>
                                <td className="text-muted">{item.template_desc}</td>
                                <td className="text-center">
                                    <StatusDropdown status={item.is_active} onChange={(val) => handleToggleStatus(item, val)} disabled={!perm.canEdit} />
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
                title={modalMode === 'add' ? 'เพิ่มข้อมูลใหม่' : modalMode === 'edit' ? 'แก้ไขข้อมูล' : 'รายละเอียดข้อมูล'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} disabled={!formData.template_name.trim() || saving}
                                style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.template_name.trim() && !saving) ? 1 : 0.5 }}>
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
                        <label style={crudStyles.label}>ชื่อข้อมูล <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อข้อมูล"
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>คำอธิบาย</label>
                        <textarea style={{ ...crudStyles.input, minHeight: '100px', resize: 'vertical' }}
                            placeholder="ระบุคำอธิบาย หรือหมายเหตุ"
                            value={formData.template_desc}
                            onChange={(e) => setFormData({ ...formData, template_desc: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <>
                            <div>
                                <label style={crudStyles.label}>สถานะการใช้งาน</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <StatusDropdown status={formData.is_active}
                                        onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                        disabled={modalMode === 'view'} />
                                    {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                                </div>
                            </div>
                            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                    <Info size={16} />
                                    <span style={{ fontSize: '13px', fontWeight: 600 }}>ข้อมูลระบบ (System Logs)</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สร้างโดย</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_by || '-'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่สร้าง</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_date ? new Date(selectedItem.create_date).toLocaleString('th-TH') : '-'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>แก้ไขล่าสุดโดย</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_by || '-'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่แก้ไขล่าสุด</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_date ? new Date(selectedItem.update_date).toLocaleString('th-TH') : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}; }}
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
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.template_name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

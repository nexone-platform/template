import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, AdvancedSearchModal, AdvancedSearchField, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import ImportExcelButton from '@/components/ImportExcelButton';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Info, Trash2, Eye, ArrowUp, ArrowDown, ChevronsUpDown, Settings } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { templateApi, Template } from '@/services/api';
import { usePagePermission } from '@/contexts/PermissionContext';
import { useSystemConfig, useLanguage } from '@nexone/ui';
import { useApiConfig } from '@/contexts/ApiConfigContext';
import { format } from 'date-fns';

export default function TemplateMaster1Page() {
    const perm = usePagePermission('Master Type 1');
    const { lang } = useLanguage();
    const { getEndpoint } = useApiConfig();
    const { configs, loading: configLoading } = useSystemConfig();
    const coreApi = getEndpoint('NexCore', '');
    const [t, setT] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const res = await fetch(`${coreApi}/translations/map?lang=${lang}`, { credentials: 'include' });
                const data = await res.json();
                if (data && typeof data === 'object') {
                    setT(data);
                }
            } catch (err) {
                console.error('Failed to load translations:', err);
            }
        };
        if (coreApi && lang) {
            fetchTranslations();
        }
    }, [coreApi, lang]);
    const [data, setData] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    // Column Settings State
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        template_id: true,
        template_name: true,
        template_desc: true,
        is_active: true
    });

    // Advanced Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advSearchValues, setAdvSearchValues] = useState<Record<string, string>>({ title: '', description: '', status: 'all' });

    const advancedSearchFields: AdvancedSearchField[] = [
        { key: 'title', label: t['title'] || 'หัวข้อ', type: 'text', placeholder: t['title'] || 'พิมพ์หัวข้อ...' },
        { key: 'description', label: t['description'] || 'คำอธิบาย', type: 'text', placeholder: t['description'] || 'พิมพ์คำอธิบาย...' },
        {
            key: 'status', label: t['status'] || 'สถานะ', type: 'select', options: [
                { value: 'all', label: t['all'] || 'ทั้งหมด' },
                { value: 'active', label: t['active'] || 'ใช้งาน' },
                { value: 'inactive', label: t['inactive'] || 'ยกเลิก' },
            ]
        },
    ];

    const handleAdvSearchChange = (key: string, value: string) => {
        setAdvSearchValues(prev => ({ ...prev, [key]: value }));
    };
    const handleAdvSearchClear = () => {
        setAdvSearchValues({ title: '', description: '', status: 'all' });
    };
    const handleAdvSearchSubmit = () => {
        setCurrentPage(1);
        setShowAdvancedSearch(false);
    };
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
    const filteredData = data.filter(item => {
        // Quick search
        const matchQuickSearch = !searchLower ||
            item.template_name.toLowerCase().includes(searchLower) ||
            (item.template_desc || '').toLowerCase().includes(searchLower);

        // Advanced search filters
        const matchTitle = !advSearchValues.title || item.template_name.toLowerCase().includes(advSearchValues.title.toLowerCase());
        const matchDesc = !advSearchValues.description || (item.template_desc || '').toLowerCase().includes(advSearchValues.description.toLowerCase());
        const matchStatus = advSearchValues.status === 'all' || advSearchValues.status === '' ||
            (advSearchValues.status === 'active' && item.is_active) ||
            (advSearchValues.status === 'inactive' && !item.is_active);

        return matchQuickSearch && matchTitle && matchDesc && matchStatus;
    });

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
        let success = 0;
        let failed = 0;
        try {
            for (const item of data) {
                if (item.template_name) {
                    await templateApi.create({
                        template_name: item.template_name,
                        template_desc: item.template_desc || '',
                        is_active: true
                    });
                    success++;
                } else {
                    failed++;
                }
            }
        } catch (err) {
            console.error('Import failed:', err);
        }
        return { success, failed };
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            toolbarLeft={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {perm.canExport && (
                        <ExportButtons
                            t={t}
                            onExportXLSX={() => exportToXLSX(filteredData, 'Template1', [
                                { key: 'template_id', label: t['template_id'] || 'รายการ' },
                                { key: 'template_name', label: t['template_name'] || 'ชื่อข้อมูล' },
                                { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                                { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ])}
                            onExportCSV={() => exportToCSV(filteredData, 'Template1', [
                                { key: 'template_id', label: t['template_id'] || 'รายการ' },
                                { key: 'template_name', label: t['template_name'] || 'ชื่อข้อมูล' },
                                { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                                { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ])}
                            onExportPDF={(orientation) => exportToPDF(filteredData, 'Template1', [
                                { key: 'template_id', label: t['template_id'] || 'รายการ' },
                                { key: 'template_name', label: t['template_name'] || 'ชื่อข้อมูล' },
                                { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                                { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ], 'Template 1 Report', orientation)}
                        />
                    )}
                    {perm.canAdd && (
                        <ImportExcelButton
                            translations={t}
                            columns={[
                                { header: t['template_name'] || 'ชื่อข้อมูล', key: 'template_name', required: true },
                                { header: t['template_desc'] || 'คำอธิบาย', key: 'template_desc' }
                            ]}
                            filenamePrefix="Template1_Import"
                            onImport={handleImport}
                            onImportComplete={() => loadData()}
                        />
                    )}
                </div>
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput
                        value={search}
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                        onClear={() => { setSearch(''); setCurrentPage(1); handleAdvSearchClear(); }}
                        placeholder={t['search_placeholder'] || 'ค้นหาตัวอย่าง...'}
                        onAdvancedSearch={() => setShowAdvancedSearch(true)}
                        advancedSearchValues={advSearchValues}
                        onAdvancedSearchClear={handleAdvSearchClear}
                        t={t}
                    />}
                    {perm.canAdd && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', height: '38.39px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>{t['add_button'] || 'เพิ่มข้อมูล'}</span></button>}
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
                                    {visibleColumns.template_id && renderTh(t['template_id'] || 'รายการ', 'template_id', '60px')}
                                    {visibleColumns.template_name && renderTh(t['template_name'] || 'ชื่อข้อมูล', 'template_name')}
                                    {visibleColumns.template_desc && renderTh(t['template_desc'] || 'คำอธิบาย', 'template_desc')}
                                    {visibleColumns.is_active && renderTh(t['is_active'] || 'สถานะ', 'is_active', '100px')}
                                    {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '16px', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            <span>{t['action'] || 'จัดการ'}</span>
                                            <span title={t['column_settings'] || 'ตั้งค่าคอลัมน์'} style={{ display: 'flex', alignItems: 'center' }}>
                                                <Settings size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsColumnSettingsOpen(true)} />
                                            </span>
                                        </div>
                                    </th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.template_id}>
                                        {visibleColumns.template_id && <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {item.template_id}</td>}
                                        {visibleColumns.template_name && <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.template_name}</span></td>}
                                        {visibleColumns.template_desc && <td className="text-muted">{item.template_desc}</td>}
                                        {visibleColumns.is_active && <td className="text-center">
                                            <StatusDropdown status={item.is_active} onChange={(val) => handleToggleStatus(item, val)} disabled={!perm.canEdit} t={t} />
                                        </td>}
                                        {hasActions && (
                                            <td className="text-center" style={{ paddingRight: '24px' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    {perm.canView && <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view_tooltip'] || "เรียกดู"}><Eye size={14} /></button>}
                                                    {perm.canEdit && <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit_tooltip'] || "แก้ไข"}><Edit2 size={14} /></button>}
                                                    {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete_tooltip'] || "ลบ"}><Trash2 size={14} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr><td colSpan={Object.values(visibleColumns).filter(Boolean).length + (hasActions ? 1 : 0)} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>{t['no_data'] || 'ไม่พบข้อมูล'}</td></tr>
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
                    t={t}
                />
            )}

            {/* Modal Add/Edit/View */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? (t['modal_add_title'] || 'เพิ่มข้อมูลใหม่') : modalMode === 'edit' ? (t['modal_edit_title'] || 'แก้ไขข้อมูล') : (t['modal_view_title'] || 'รายละเอียดข้อมูล')}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['cancel'] || 'ยกเลิก'}</button>
                            <button onClick={saveForm} disabled={!formData.template_name.trim() || saving}
                                style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.template_name.trim() && !saving) ? 1 : 0.5 }}>
                                {saving ? (t['saving'] || 'กำลังบันทึก...') : modalMode === 'add' ? (t['add_button'] || 'เพิ่มข้อมูล') : (t['save_button'] || 'บันทึกข้อมูล')}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['close'] || 'ปิด'}</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>{t['template_name'] || 'ชื่อข้อมูล'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder={t['template_name_placeholder'] || "ระบุชื่อข้อมูล"}
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['template_desc'] || 'คำอธิบาย'}</label>
                        <textarea style={{ ...crudStyles.input, minHeight: '100px', resize: 'vertical' }}
                            placeholder={t['template_desc_placeholder'] || "ระบุคำอธิบาย หรือหมายเหตุ"}
                            value={formData.template_desc}
                            onChange={(e) => setFormData({ ...formData, template_desc: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>{t['usage_status'] || 'สถานะการใช้งาน'}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.is_active}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                    disabled={modalMode === 'view'} t={t} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t['view_only_remark'] || '*(ดูอย่างเดียว)'}</span>}
                            </div>
                        </div>
                    )}
                    {modalMode === 'view' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                <Info size={16} />
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{t['system_logs'] || 'ข้อมูลระบบ (System Logs)'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>{t['create_by'] || 'สร้างโดย'} : </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>{t['create_date'] || 'วันที่สร้าง'} : </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_date ? format(new Date(selectedItem.create_date), configs.dateFormat || 'dd/MM/yyyy') : '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>{t['update_by'] || 'แก้ไขล่าสุดโดย'} : </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>{t['update_date'] || 'วันที่แก้ไขล่าสุด'} : </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_date ? format(new Date(selectedItem.update_date), configs.dateFormat || 'dd/MM/yyyy') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Confirm Modal */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={t['delete_confirm_title'] || 'ยืนยันการลบข้อมูล'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? (t['deleting'] || 'กำลังลบ...') : (t['delete_button'] || 'ลบข้อมูล')}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>{t['delete_confirm_message'] || 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล'}</p>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}><strong>{selectedItem?.template_name}</strong></p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{t['delete_warning'] || 'การกระทำนี้จะไม่สามารถย้อนกลับได้'}</p>
                </div>
            </BaseModal>

            {/* Column Settings Modal */}
            <BaseModal
                isOpen={isColumnSettingsOpen}
                onClose={() => setIsColumnSettingsOpen(false)}
                title={t['column_settings_title'] || 'ตั้งค่าการแสดงผลตาราง'}
                width="450px"
                footer={
                    <button onClick={() => setIsColumnSettingsOpen(false)} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['ok_button'] || 'ตกลง'}</button>
                }
            >
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{t['select_columns_to_show'] || 'เลือกคอลัมน์ที่ต้องการแสดง'}</h4>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, width: '130px' }}>{t['sort_data'] || 'เรียงลำดับข้อมูล'}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* รายการ */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.template_id} onChange={(e) => setVisibleColumns({ ...visibleColumns, template_id: e.target.checked })} /> {t['template_id'] || 'รายการ'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'template_id' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'template_id', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* ชื่อข้อมูล */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.template_name} onChange={(e) => setVisibleColumns({ ...visibleColumns, template_name: e.target.checked })} /> {t['template_name'] || 'ชื่อข้อมูล'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'template_name' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'template_name', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* คำอธิบาย */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.template_desc} onChange={(e) => setVisibleColumns({ ...visibleColumns, template_desc: e.target.checked })} /> {t['template_desc'] || 'คำอธิบาย'}
                            </label>
                            <select disabled style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0, opacity: 0.5 }}>
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                            </select>
                        </div>

                        {/* สถานะ */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.is_active} onChange={(e) => setVisibleColumns({ ...visibleColumns, is_active: e.target.checked })} /> {t['is_active'] || 'สถานะ'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'is_active' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'is_active', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </BaseModal>

            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                title={t['advanced_search_title'] || 'ค้นหาขั้นสูง'}
                fields={advancedSearchFields}
                values={advSearchValues}
                onChange={handleAdvSearchChange}
                onSearch={handleAdvSearchSubmit}
                onClear={handleAdvSearchClear}
                t={t}
            />
        </CrudLayout>
    );
}

import { useSystemConfig, useLanguage } from '@nexone/ui';
import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, AdvancedSearchModal, AdvancedSearchField, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import ImportExcelButton from '@/components/ImportExcelButton';
import { Plus, Edit2, Trash2, Tags, Box, Eye, Info } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { templateApi, Template } from '@/services/api';
import { usePagePermission } from '@/contexts/PermissionContext';
import { useApiConfig } from '@/contexts/ApiConfigContext';
import { format } from 'date-fns';

export default function TemplateMaster2Page() {
    // ---- Permission: ใช้ menuCode ที่ตรงกับ DB (menus.menu_code หรือ title) ----
    const perm = usePagePermission('Master Type 2');
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
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Advanced Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advSearchValues, setAdvSearchValues] = useState<Record<string, string>>({ title: '', category: '', description: '', status: 'all' });

    const advancedSearchFields: AdvancedSearchField[] = [
        { key: 'title', label: t['title'] || 'หัวข้อ', type: 'text', placeholder: t['search_title'] || 'พิมพ์หัวข้อ...' },
        { key: 'category', label: t['category'] || 'หมวดหมู่', type: 'text', placeholder: t['search_category'] || 'พิมพ์หมวดหมู่...' },
        { key: 'description', label: t['description'] || 'คำอธิบาย', type: 'text', placeholder: t['search_desc'] || 'พิมพ์คำอธิบาย...' },
        { key: 'status', label: t['status'] || 'สถานะ', type: 'select', options: [
            { value: 'all', label: t['all'] || 'ทั้งหมด' },
            { value: 'active', label: t['active'] || 'ใช้งาน' },
            { value: 'inactive', label: t['inactive'] || 'ยกเลิก' },
        ]},
    ];

    const handleAdvSearchChange = (key: string, value: string) => {
        setAdvSearchValues(prev => ({ ...prev, [key]: value }));
    };
    const handleAdvSearchClear = () => {
        setAdvSearchValues({ title: '', category: '', description: '', status: 'all' });
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
    const [saving, setSaving] = useState(false);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Template | null>(null);
    const [formData, setFormData] = useState({ template_name: '', template_group: '', template_desc: '', is_active: true });
    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, isError: boolean}>({isOpen: false, message: '', isError: false});

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    const loadData = useCallback(() => {
        setLoading(true);
        templateApi.getAll()
            .then(res => { setData(res || []); })
            .catch(err => { console.error('Failed to load templates:', err); setData([]); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Derive categories from DB data + custom ones
    const dbCategories = Array.from(new Set(data.map(d => d.template_group).filter(Boolean)));
    const categories = Array.from(new Set([...dbCategories, ...customCategories]));

    // Action Handlers
    const handleAdd = () => {
        setFormData({ template_name: '', template_group: categories[0] || '', template_desc: '', is_active: true });
        setModalMode('add');
        setIsModalOpen(true);
    };
    const handleEdit = (item: Template) => {
        setFormData({ template_name: item.template_name, template_group: item.template_group || '', template_desc: item.template_desc || '', is_active: item.is_active });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleView = (item: Template) => {
        setFormData({ template_name: item.template_name, template_group: item.template_group || '', template_desc: item.template_desc || '', is_active: item.is_active });
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
        if (!formData.template_name.trim()) {
            setAlertConfig({isOpen: true, message: t['require_template_name'] || 'กรุณาระบุชื่อข้อมูล', isError: true});
            return;
        }
        setSaving(true);
        try {
            if (modalMode === 'add') {
                await templateApi.create({ template_name: formData.template_name, template_group: formData.template_group, template_desc: formData.template_desc, is_active: formData.is_active });
                setAlertConfig({isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false});
            } else if (modalMode === 'edit' && selectedItem) {
                await templateApi.update(selectedItem.template_id, { template_name: formData.template_name, template_group: formData.template_group, template_desc: formData.template_desc, is_active: formData.is_active });
                setAlertConfig({isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false});
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) { 
            console.error(err); 
            setAlertConfig({isOpen: true, message: err.message || t['error_saving'] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', isError: true});
        }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            await templateApi.remove(selectedItem.template_id);
            setAlertConfig({isOpen: true, message: t['delete_success'] || 'ลบข้อมูลเรียบร้อยแล้ว', isError: false});
            setIsModalOpen(false);
            loadData();
        } catch (err: any) { 
            console.error(err); 
            setAlertConfig({isOpen: true, message: err.message || t['error_deleting'] || 'ลบข้อมูลไม่สำเร็จ', isError: true});
        }
        setSaving(false);
    };

    const handleToggleStatus = async (item: Template, val: boolean) => {
        try {
            await templateApi.toggleStatus(item.template_id, val);
            setData(prev => prev.map(d => d.template_id === item.template_id ? { ...d, is_active: val } : d));
        } catch (err: any) { 
            console.error(err); 
            setAlertConfig({isOpen: true, message: err.message || t['error_saving'] || 'เปลี่ยนสถานะไม่สำเร็จ', isError: true});
        }
    };

    const handleSaveCategory = () => {
        if (!newCategoryName.trim()) return;
        if (!categories.includes(newCategoryName.trim())) {
            setCustomCategories(prev => [...prev, newCategoryName.trim()]);
            setFormData(prev => ({ ...prev, template_group: newCategoryName.trim() }));
        }
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
    };

    const searchLower = search.toLowerCase();
    const baseData = data.filter(item => {
        // Quick search
        const matchQuickSearch = !searchLower ||
            item.template_name.toLowerCase().includes(searchLower) ||
            (item.template_desc || '').toLowerCase().includes(searchLower);

        // Advanced search filters
        const matchTitle = !advSearchValues.title || item.template_name.toLowerCase().includes(advSearchValues.title.toLowerCase());
        const matchCategory = !advSearchValues.category || (item.template_group || '').toLowerCase().includes(advSearchValues.category.toLowerCase());
        const matchDesc = !advSearchValues.description || (item.template_desc || '').toLowerCase().includes(advSearchValues.description.toLowerCase());
        const matchStatus = advSearchValues.status === 'all' || advSearchValues.status === '' ||
            (advSearchValues.status === 'active' && item.is_active) ||
            (advSearchValues.status === 'inactive' && !item.is_active);

        return matchQuickSearch && matchTitle && matchCategory && matchDesc && matchStatus;
    });

    const uniqueCategories = Array.from(new Set(data.map(item => item.template_group).filter(Boolean)));

    const filteredData = baseData.filter(item => {
        if (filterType === 'all') return true;
        return item.template_group === filterType;
    });

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const importColumns = [
        { key: 'template_name', header: t['template_name'] || 'หัวข้อ', required: true, type: 'string' as const },
        { key: 'template_group', header: t['template_group'] || 'หมวดหมู่', required: true, type: 'string' as const },
        { key: 'template_desc', header: t['template_desc'] || 'คำอธิบาย', type: 'string' as const }
    ];

    const handleImport = async (rows: any[]) => {
        let success = 0;
        let failed = 0;
        for (const row of rows) {
            try {
                await templateApi.create({
                    template_name: row.template_name,
                    template_group: row.template_group,
                    template_desc: row.template_desc,
                    is_active: true
                });
                success++;
            } catch {
                failed++;
            }
        }
        return { success, failed };
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard
                        title={t['total_items'] || "รายการทั้งหมด"}
                        count={baseData.length}
                        icon={<Tags size={22} />}
                        color="#3b82f6"
                        isActive={filterType === 'all'}
                        onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                    />
                    {uniqueCategories.map((category, index) => {
                        const count = baseData.filter(i => i.template_group === category).length;
                        const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                        return (
                            <SummaryCard
                                key={category}
                                title={category}
                                count={count}
                                icon={<Box size={22} />}
                                color={colors[index % colors.length]}
                                isActive={filterType === category}
                                onClick={() => { setFilterType(category); setCurrentPage(1); }}
                            />
                        );
                    })}
                </>
            }
            toolbarLeft={
                perm.canExport ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ExportButtons
                    t={t}
                    onExportXLSX={() => exportToXLSX(filteredData, 'Template2', [
                        { key: 'template_id', label: t['template_id'] || 'ID' },
                        { key: 'template_name', label: t['template_name'] || 'หัวข้อ' },
                        { key: 'template_group', label: t['template_group'] || 'หมวดหมู่' },
                        { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                        { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Template2', [
                        { key: 'template_id', label: t['template_id'] || 'ID' },
                        { key: 'template_name', label: t['template_name'] || 'หัวข้อ' },
                        { key: 'template_group', label: t['template_group'] || 'หมวดหมู่' },
                        { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                        { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                    ])}
                    onExportPDF={(orientation) => exportToPDF(filteredData, 'Template2', [
                        { key: 'template_id', label: t['template_id'] || 'ID' },
                        { key: 'template_name', label: t['template_name'] || 'หัวข้อ' },
                        { key: 'template_group', label: t['template_group'] || 'หมวดหมู่' },
                        { key: 'template_desc', label: t['template_desc'] || 'คำอธิบาย' },
                        { key: 'is_active', label: t['is_active'] || 'สถานะ', format: (v: any) => v.is_active ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                    ], 'Template 2 Report', orientation)}
                />
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />
                <ImportExcelButton translations={t} columns={importColumns as any} filenamePrefix="Template2" onImport={handleImport} onImportComplete={loadData} />
                </div>
                ) : undefined
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput 
                        value={search} 
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                        onClear={() => { setSearch(''); setCurrentPage(1); handleAdvSearchClear(); }} 
                        placeholder={t['search_placeholder'] || "ค้นหาตัวอย่าง..."} 
                        onAdvancedSearch={() => setShowAdvancedSearch(true)}
                        advancedSearchValues={advSearchValues}
                        onAdvancedSearchClear={handleAdvSearchClear}
                    />}
                    {perm.canAdd && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>{t['add_data'] || 'เพิ่มข้อมูล'}</span></button>}
                </>
            }
        >
            {(() => {
            const hasActions = perm.canView || perm.canEdit || perm.canDelete;
            return (
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>{t['template_id'] || 'ID'}</th>
                            <th>{t['template_name'] || 'หัวข้อ'}</th>
                            <th>{t['template_group'] || 'หมวดหมู่'}</th>
                            <th>{t['template_desc'] || 'อธิบายการใช้งาน'}</th>
                            <th className="text-center" style={{ width: '100px' }}>{t['is_active'] || 'สถานะ'}</th>
                            {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>{t['manage'] || 'จัดการ'}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.template_id}>
                                <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {item.template_id}</td>
                                <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.template_name}</span></td>
                                <td className="text-muted text-small">{item.template_group}</td>
                                <td className="text-muted">{item.template_desc}</td>
                                <td className="text-center">
                                    <StatusDropdown status={item.is_active} onChange={(val) => handleToggleStatus(item, val)} disabled={!perm.canEdit} />
                                </td>
                                {hasActions && (
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        {perm.canView   && <button onClick={() => handleView(item)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view'] || 'เรียกดู'}><Eye    size={14} /></button>}
                                        {perm.canEdit   && <button onClick={() => handleEdit(item)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit'] || 'แก้ไข'}><Edit2  size={14} /></button>}
                                        {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete'] || 'ลบ'}><Trash2 size={14} /></button>}
                                    </div>
                                </td>
                                )}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan={hasActions ? 6 : 5} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>{t['no_data_found'] || 'ไม่พบข้อมูล'}</td></tr>
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
                    translations={t}
                />
            )}

            {/* Modal Add/Edit/View */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? (t['add_new_data'] || 'เพิ่มข้อมูลใหม่') : modalMode === 'edit' ? (t['edit_data'] || 'แก้ไขข้อมูล') : (t['view_data'] || 'รายละเอียดข้อมูล')}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['cancel'] || 'ยกเลิก'}</button>
                            <button onClick={saveForm} disabled={saving}
                                style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>
                                {saving ? (t['saving'] || 'กำลังบันทึก...') : modalMode === 'add' ? (t['save_data'] || 'บันทึกข้อมูล') : (t['save_data'] || 'บันทึกข้อมูล')}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['close'] || 'ปิด'}</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>{t['template_name'] || 'หัวข้อ'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder={t['enter_title'] || 'ระบุชื่อหัวข้อ'}
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...crudStyles.label, marginBottom: 0 }}>{t['template_group'] || 'หมวดหมู่'} <span style={{ color: '#ef4444' }}>*</span></label>
                            {modalMode !== 'view' && (
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                    <Plus size={14} /> <span>{t['add_category'] || 'เพิ่มหมวดหมู่'}</span>
                                </button>
                            )}
                        </div>
                        <select style={{ ...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer' }}
                            value={formData.template_group}
                            onChange={(e) => setFormData({ ...formData, template_group: e.target.value })}
                            disabled={modalMode === 'view'}>
                            {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['template_desc'] || 'อธิบายการใช้งาน'}</label>
                        <textarea style={{ ...crudStyles.input, minHeight: '100px', resize: 'vertical' }}
                            placeholder={t['enter_desc'] || 'ระบุคำอธิบาย หรือหมายเหตุ'}
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
                                    disabled={modalMode === 'view'} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t['read_only'] || '*(ดูอย่างเดียว)'}</span>}
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
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t['created_by'] || 'สร้างโดย'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t['create_date'] || 'วันที่สร้าง'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_date ? format(new Date(selectedItem.create_date), configs?.dateFormat || 'dd/MM/yyyy') : '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t['updated_by'] || 'แก้ไขล่าสุดโดย'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t['update_date'] || 'วันที่แก้ไขล่าสุด'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_date ? format(new Date(selectedItem.update_date), configs?.dateFormat || 'dd/MM/yyyy') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Confirm */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={t['confirm_delete_title'] || 'ยืนยันการลบข้อมูล'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? (t['deleting'] || 'กำลังลบ...') : (t['delete_data'] || 'ลบข้อมูล')}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>{t['delete_confirm_msg'] || 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล'} <br /><strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.template_name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{t['cannot_undo'] || 'การกระทำนี้จะไม่สามารถย้อนกลับได้'}</p>
                </div>
            </BaseModal>

            {/* Add Category Modal */}
            <BaseModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={t['add_new_category'] || 'เพิ่มหมวดหมู่ใหม่'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={handleSaveCategory} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['add_category'] || 'เพิ่มหมวดหมู่'}</button>
                    </>
                }
            >
                <div>
                    <label style={crudStyles.label}>{t['category_name'] || 'ชื่อหมวดหมู่'}</label>
                    <input type="text" style={crudStyles.input} placeholder={t['enter_category_name'] || 'ระบุชื่อหมวดหมู่'}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)} />
                </div>
            </BaseModal>
            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                fields={advancedSearchFields}

                values={advSearchValues}
                onChange={handleAdvSearchChange}
                onSearch={handleAdvSearchSubmit}
                onClear={handleAdvSearchClear}
            />

            {/* Custom Alert Modal */}
            <BaseModal 
                isOpen={alertConfig.isOpen} 
                onClose={() => setAlertConfig({...alertConfig, isOpen: false})}
                title={alertConfig.isError ? (t['error_title'] || "แจ้งเตือนข้อผิดพลาด") : (t['success_title'] || "สำเร็จ")}
                width="400px"
                footer={
                    <button onClick={() => setAlertConfig({...alertConfig, isOpen: false})} style={{ padding: '8px 16px', background: alertConfig.isError ? '#ef4444' : 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, width: '100px' }}>{t['ok_button'] || 'ตกลง'}</button>
                }
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>{alertConfig.message}</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

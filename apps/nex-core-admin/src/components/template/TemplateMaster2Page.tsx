import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Tags, Box, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { templateApi, Template } from '@/services/api';
import { usePagePermission } from '@/contexts/PermissionContext';

export default function TemplateMaster2Page() {
    // ---- Permission: ใช้ menuCode ที่ตรงกับ DB (menus.menu_code หรือ title) ----
    const perm = usePagePermission('Master Type 2');

    const [data, setData] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [saving, setSaving] = useState(false);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Template | null>(null);
    const [formData, setFormData] = useState({ template_name: '', template_group: '', template_desc: '', is_active: true });

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
        if (!formData.template_name.trim()) return;
        setSaving(true);
        try {
            if (modalMode === 'add') {
                await templateApi.create({ template_name: formData.template_name, template_group: formData.template_group, template_desc: formData.template_desc, is_active: formData.is_active });
            } else if (modalMode === 'edit' && selectedItem) {
                await templateApi.update(selectedItem.template_id, { template_name: formData.template_name, template_group: formData.template_group, template_desc: formData.template_desc, is_active: formData.is_active });
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
    const baseData = data.filter(item =>
        !searchLower ||
        item.template_name.toLowerCase().includes(searchLower) ||
        (item.template_desc || '').toLowerCase().includes(searchLower)
    );

    const uniqueCategories = Array.from(new Set(data.map(item => item.template_group).filter(Boolean)));

    const filteredData = baseData.filter(item => {
        if (filterType === 'all') return true;
        return item.template_group === filterType;
    });

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard
                        title="รายการทั้งหมด"
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
                <ExportButtons
                    onExportXLSX={() => exportToXLSX(filteredData, 'Template2', [
                        { key: 'template_id', label: 'ID' },
                        { key: 'template_name', label: 'หัวข้อ' },
                        { key: 'template_group', label: 'หมวดหมู่' },
                        { key: 'template_desc', label: 'คำอธิบาย' },
                        { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Template2', [
                        { key: 'template_id', label: 'ID' },
                        { key: 'template_name', label: 'หัวข้อ' },
                        { key: 'template_group', label: 'หมวดหมู่' },
                        { key: 'template_desc', label: 'คำอธิบาย' },
                        { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Template2', [
                        { key: 'template_id', label: 'ID' },
                        { key: 'template_name', label: 'หัวข้อ' },
                        { key: 'template_group', label: 'หมวดหมู่' },
                        { key: 'template_desc', label: 'คำอธิบาย' },
                        { key: 'is_active', label: 'สถานะ', format: (v: any) => v.is_active ? 'ใช้งาน' : 'ยกเลิก' }
                    ], 'Template 2 Report')}
                />
                ) : undefined
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาตัวอย่าง..." />}
                    {perm.canAdd && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>}
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
                            <th style={{ width: '60px' }}>ID</th>
                            <th>หัวข้อ</th>
                            <th>หมวดหมู่</th>
                            <th>อธิบายการใช้งาน</th>
                            <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                            {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>}
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
                                        {perm.canView   && <button onClick={() => handleView(item)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู"><Eye    size={14} /></button>}
                                        {perm.canEdit   && <button onClick={() => handleEdit(item)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข"><Edit2  size={14} /></button>}
                                        {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ"><Trash2 size={14} /></button>}
                                    </div>
                                </td>
                                )}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan={hasActions ? 6 : 5} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>ไม่พบข้อมูล</td></tr>
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
                        <label style={crudStyles.label}>หัวข้อ <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อหัวข้อ"
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...crudStyles.label, marginBottom: 0 }}>หมวดหมู่ <span style={{ color: '#ef4444' }}>*</span></label>
                            {modalMode !== 'view' && (
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                    <Plus size={14} /> <span>เพิ่มหมวดหมู่</span>
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
                        <label style={crudStyles.label}>อธิบายการใช้งาน</label>
                        <textarea style={{ ...crudStyles.input, minHeight: '100px', resize: 'vertical' }}
                            placeholder="ระบุคำอธิบาย หรือหมายเหตุ"
                            value={formData.template_desc}
                            onChange={(e) => setFormData({ ...formData, template_desc: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.is_active}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                    disabled={modalMode === 'view'} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Confirm */}
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

            {/* Add Category Modal */}
            <BaseModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="เพิ่มหมวดหมู่ใหม่"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                        <button onClick={handleSaveCategory} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>เพิ่มหมวดหมู่</button>
                    </>
                }
            >
                <div>
                    <label style={crudStyles.label}>ชื่อหมวดหมู่</label>
                    <input type="text" style={crudStyles.input} placeholder="ระบุชื่อหมวดหมู่"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)} />
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

'use client';

import React, { useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import StatusDropdown from '@/components/StatusDropdown';
import Pagination from '@/components/Pagination';
import { Plus, Edit2, Trash2, Eye, ClipboardList } from 'lucide-react';
import { api } from '@/services/api';

export interface MaintenancePlan {
    id: string;
    name: string;
    targetVehicle: string;
    criteriaType: 'ระยะทาง' | 'ระยะเวลา';
    criteriaValue: string;
    description: string;
    status: string;
}

const mockPlans: MaintenancePlan[] = [
    { id: '1', name: 'เช็คระยะ 10,000 กม.', targetVehicle: 'รถกระบะ, รถตู้', criteriaType: 'ระยะทาง', criteriaValue: '10000', description: 'เปลี่ยนถ่ายน้ำมันเครื่อง กรองน้ำมันเครื่อง เช็คลมยาง', status: 'ใช้งาน' },
    { id: '2', name: 'เช็คระยะ 50,000 กม.', targetVehicle: 'รถสิบล้อ, รถเทรลเลอร์', criteriaType: 'ระยะทาง', criteriaValue: '50000', description: 'เปลี่ยนน้ำมันเครื่อง เกียร์ เฟืองท้าย เช็คตั้งวาล์ว', status: 'ใช้งาน' },
    { id: '3', name: 'เปลี่ยนยางทุก 2 ปี', targetVehicle: 'ทั้งหมด', criteriaType: 'ระยะเวลา', criteriaValue: '24', description: 'เปลี่ยนยางหน้าและยางหลัง ตั้งศูนย์ถ่วงล้อ', status: 'ใช้งาน' },
    { id: '4', name: 'เช็คระบบแอร์รายปี', targetVehicle: 'ทั้งหมด', criteriaType: 'ระยะเวลา', criteriaValue: '12', description: 'ล้างตู้แอร์ เช็คระบบน้ำยา และคอมเพรสเซอร์', status: 'ใช้งาน' },
    { id: '5', name: 'ตรวจสภาพก่อนต่อภาษี', targetVehicle: 'ทั้งหมด', criteriaType: 'ระยะเวลา', criteriaValue: '12', description: 'ตรวจเช็คไฟสัญญาณ เบรค และสภาพช่วงล่าง', status: 'ใช้งาน' },
];

export default function MaintenancePlanPage() {
    const [plans, setPlans] = useState<MaintenancePlan[]>(mockPlans);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<MaintenancePlan | null>(null);
    const [formData, setFormData] = useState<Partial<MaintenancePlan>>({
        name: '', targetVehicle: 'ทั้งหมด', criteriaType: 'ระยะทาง', criteriaValue: '', description: '', status: 'ใช้งาน'
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleAdd = () => {
        setFormData({ name: '', targetVehicle: 'ทั้งหมด', criteriaType: 'ระยะทาง', criteriaValue: '', description: '', status: 'ใช้งาน' });
        setFormErrors({});
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: MaintenancePlan) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setFormErrors({});
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: MaintenancePlan) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setFormErrors({});
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: MaintenancePlan) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        const errors: { [key: string]: string } = {};
        if (!formData.name?.trim()) errors.name = 'กรุณาระบุชื่อแผนบำรุงรักษา';
        else {
            const dup = plans.find(x => x.name.trim() === formData.name!.trim() && (!selectedItem || x.id !== selectedItem.id));
            if (dup) errors.name = 'ชื่อแผนนี้มีอยู่แล้วในระบบ';
        }
        if (!formData.criteriaValue?.trim()) errors.criteriaValue = 'กรุณาระบุค่าเกณฑ์';

        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

        try {
            if (modalMode === 'add') {
                const newPlan = { ...formData as MaintenancePlan, id: Math.random().toString() };
                setPlans(prev => [newPlan, ...prev]);
                // await api.createMaintenancePlan(formData as Partial<MaintenancePlan>);
            } else if (modalMode === 'edit' && selectedItem) {
                setPlans(prev => prev.map(p => p.id === selectedItem.id ? { ...p, ...formData as MaintenancePlan } : p));
                try { await api.updateMaintenancePlan(selectedItem.id as any, formData as Partial<MaintenancePlan>); } catch (e) { console.error(e); }
            }
            setIsModalOpen(false);
        } catch (e) { console.error(e); }
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            setPlans(prev => prev.filter(p => p.id !== selectedItem.id));
        }
        setIsModalOpen(false);
    };

    // Filter
    const searchLower = search.toLowerCase();
    const filteredData = plans.filter(item =>
        !searchLower ||
        item.name.toLowerCase().includes(searchLower) ||
        item.targetVehicle.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
    );

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

    const exportConfigs = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'ชื่อแผนบำรุงรักษา' },
        { key: 'targetVehicle', label: 'ประเภทรถที่บังคับใช้' },
        { key: 'criteriaType', label: 'ประเภทเกณฑ์' },
        { key: 'criteriaValue', label: 'ค่าเกณฑ์' },
        { key: 'description', label: 'รายละเอียด' },
        { key: 'status', label: 'สถานะ' },
    ];

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'MaintenancePlan', exportConfigs)}
                    onExportCSV={() => exportToCSV(filteredData, 'MaintenancePlan', exportConfigs)}
                    onExportPDF={() => exportToPDF(filteredData, 'MaintenancePlan', exportConfigs, 'รายงานแผนบำรุงรักษา')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาแผนบำรุงรักษา..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                            <th>ชื่อแผนบำรุงรักษา</th>
                            <th>ประเภทรถที่บังคับใช้</th>
                            <th>เกณฑ์การแจ้งเตือน</th>
                            <th>รายละเอียด</th>
                            <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((p, i) => (
                            <tr key={p.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(safePage - 1) * pageSize + i + 1}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ClipboardList size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                        <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{p.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{p.targetVehicle}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.criteriaType} {p.criteriaType === 'ระยะทาง' ? '(กม.)' : '(เดือน)'}</span>
                                        <span style={{ fontWeight: 600 }}>
                                            {Number(p.criteriaValue).toLocaleString()} {p.criteriaType === 'ระยะทาง' ? 'กม.' : 'เดือน'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.description || '-'}
                                </td>
                                <td className="text-center">
                                    <StatusDropdown
                                        value={p.status}
                                        onChange={async (val: any) => {
                                            setPlans(prev => prev.map(x => x.id === p.id ? { ...x, status: val } : x));
                                            try { await api.updateMaintenancePlan(p.id as any, { ...p, status: val } as any); } catch (e) { console.error(e); }
                                        }}
                                        options={[
                                            { value: 'ใช้งาน', label: 'ใช้งาน', color: 'green' },
                                            { value: 'ระงับ', label: 'ระงับ', color: 'red' }
                                        ]}
                                    />
                                </td>
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button onClick={() => handleView(p)} style={crudStyles.viewBtn} title="เรียกดู">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleEdit(p)} style={crudStyles.editBtn} title="แก้ไข">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(p)} style={crudStyles.deleteBtn} title="ลบ">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                    ไม่พบข้อมูลแผนการบำรุงรักษา
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={safePage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* Add / Edit / View Modal */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === 'add' ? 'สร้างแผนบำรุงรักษาใหม่' :
                    modalMode === 'edit' ? 'แก้ไขแผนบำรุงรักษา' :
                    'รายละเอียดแผนบำรุงรักษา'
                }
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.name?.trim() && formData.criteriaValue?.trim()) ? 1 : 0.5 }}  disabled={!formData.name?.trim() || !formData.criteriaValue?.trim()}>{modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* ชื่อแผน */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>ชื่อแผนบำรุงรักษา <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            style={{ ...crudStyles.input, borderColor: formErrors.name ? '#ef4444' : 'var(--border-color)' }}
                            placeholder="เช่น เช็คระยะ 10,000 กม."
                            value={formData.name || ''}
                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }}
                            disabled={modalMode === 'view'}
                        />
                        {formErrors.name && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{formErrors.name}</div>}
                    </div>

                    {/* ประเภทรถ */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>ประเภทรถที่บังคับใช้</label>
                        <input
                            type="text"
                            style={crudStyles.input}
                            placeholder="เช่น ทั้งหมด, รถกระบะ, รถเทรลเลอร์"
                            value={formData.targetVehicle || ''}
                            onChange={(e) => setFormData({ ...formData, targetVehicle: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                    </div>

                    {/* ประเภทเกณฑ์ */}
                    <div>
                        <label style={crudStyles.label}>ประเภทเกณฑ์การแจ้งเตือน</label>
                        <select
                            style={crudStyles.input}
                            value={formData.criteriaType}
                            onChange={(e) => setFormData({ ...formData, criteriaType: e.target.value as any })}
                            disabled={modalMode === 'view'}
                        >
                            <option value="ระยะทาง">ตามระยะทาง (กม.)</option>
                            <option value="ระยะเวลา">ตามระยะเวลา (วัน/เดือน/ปี)</option>
                        </select>
                    </div>

                    {/* ค่าเกณฑ์ */}
                    <div>
                        <label style={crudStyles.label}>ค่าของเกณฑ์ <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="number"
                            min="1"
                            style={{ ...crudStyles.input, borderColor: formErrors.criteriaValue ? '#ef4444' : 'var(--border-color)' }}
                            placeholder={formData.criteriaType === 'ระยะทาง' ? 'เช่น 10000' : 'เช่น 6'}
                            value={formData.criteriaValue || ''}
                            onChange={(e) => { setFormData({ ...formData, criteriaValue: e.target.value }); if (formErrors.criteriaValue) setFormErrors({ ...formErrors, criteriaValue: '' }); }}
                            disabled={modalMode === 'view'}
                        />
                        {formErrors.criteriaValue && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{formErrors.criteriaValue}</div>}
                    </div>

                    {/* รายละเอียด */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>รายละเอียดการดำเนินงาน</label>
                        <textarea
                            style={{ ...crudStyles.input, minHeight: '80px', resize: 'vertical' }}
                            placeholder="ระบุรายการที่ต้องทำในการเช็คระยะ/บำรุงรักษานี้..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                    </div>

                    {/* สถานะ (แสดงแค่ตอน edit/view) */}
                    {modalMode !== 'add' && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <select
                                style={crudStyles.input}
                                value={formData.status}
                                onChange={(e) => { if (modalMode !== 'view') setFormData({ ...formData, status: e.target.value }); }}
                                disabled={modalMode === 'view'}
                            >
                                <option value="ใช้งาน">ใช้งาน</option>
                                <option value="ระงับ">❌ ระงับแผนชั่วคราว</option>
                            </select>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Modal */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบแผน <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

import React, { useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Eye, MapPin, Phone, User, Hash } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface Branch {
  id: string;
  code: string;
  name: string;
  manager: string;
  phone: string;
  status: boolean;
}

const INITIAL_BRANCHES: Branch[] = [
  { id: '1', code: 'HQ01', name: 'สำนักงานใหญ่ (กทม.)', manager: 'นายสมชาย ใจดี', phone: '02-123-4567', status: true },
  { id: '2', code: 'BR01', name: 'สาขาระยอง', manager: 'นายสมปอง น้องรัก', phone: '038-123-456', status: true },
  { id: '3', code: 'BR02', name: 'สาขาเชียงใหม่', manager: 'นางสาววิไลลักษณ์ งามตา', phone: '053-456-789', status: true },
  { id: '4', code: 'BR03', name: 'สาขาขอนแก่น', manager: 'นายประเสริฐ ยอดเยี่ยม', phone: '043-987-654', status: false },
];

export default function BranchSettings() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Branch | null>(null);
    const [formData, setFormData] = useState<Partial<Branch>>({ code: '', name: '', manager: '', phone: '', status: true });

    // Action Handlers
    const handleAdd = () => {
        setFormData({ code: '', name: '', manager: '', phone: '', status: true });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: Branch) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: Branch) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: Branch) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = () => {
        if (!formData.name?.trim() || !formData.code?.trim()) return;
        if (modalMode === 'add') {
            const newId = String(branches.length + 1);
            setBranches([{ id: newId, ...formData } as Branch, ...branches]);
            setIsModalOpen(false);
        } else if (modalMode === 'edit') {
            setBranches(prev => prev.map(d => d.id === selectedItem?.id ? { ...d, ...formData } as Branch : d));
            setIsModalOpen(false);
        }
    };

    const confirmDelete = () => {
        setBranches(prev => prev.filter(d => d.id !== selectedItem?.id));
        setIsModalOpen(false);
    };

    // Filter
    const searchLower = search.toLowerCase();
    const filteredData = branches.filter(item => 
        !searchLower || 
        item.name.toLowerCase().includes(searchLower) || 
        item.code.toLowerCase().includes(searchLower) ||
        item.manager.toLowerCase().includes(searchLower)
    );

    // Pagination
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Branches', [
                        { key: 'code', label: 'รหัสสาขา' },
                        { key: 'name', label: 'ชื่อสาขา' },
                        { key: 'manager', label: 'ผู้จัดการสาขา' },
                        { key: 'phone', label: 'เบอร์ติดต่อ' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Branches', [
                        { key: 'code', label: 'รหัสสาขา' },
                        { key: 'name', label: 'ชื่อสาขา' },
                        { key: 'manager', label: 'ผู้จัดการสาขา' },
                        { key: 'phone', label: 'เบอร์ติดต่อ' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Branches', [
                        { key: 'code', label: 'รหัสสาขา' },
                        { key: 'name', label: 'ชื่อสาขา' },
                        { key: 'manager', label: 'ผู้จัดการสาขา' },
                        { key: 'phone', label: 'เบอร์ติดต่อ' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }
                    ], 'Branch List Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหารหัส, ชื่อสาขา, ผู้จัดการ..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มสาขาใหม่</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                        <th>รหัสสาขา</th>
                        <th>ชื่อสาขา</th>
                        <th>ผู้จัดการสาขา</th>
                        <th>เบอร์ติดต่อ</th>
                        <th className="text-center" style={{ width: '120px' }}>สถานะ</th>
                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                    <Hash size={14} style={{ opacity: 0.7 }} /> {item.code}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={16} />
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{item.name}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <User size={14} color="var(--text-muted)" /> {item.manager}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <Phone size={14} color="var(--text-muted)" /> {item.phone}
                                </div>
                            </td>
                            <td className="text-center">
                                <StatusDropdown 
                                    status={item.status} 
                                    onChange={(val) => {
                                        setBranches(prev => prev.map(d => d.id === item.id ? { ...d, status: val } : d));
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
                                    <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {branches.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                ไม่พบข้อมูลสาขา
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
                title={modalMode === 'add' ? 'เพิ่มสาขาใหม่' : modalMode === 'edit' ? 'แก้ไขข้อมูลสาขา' : 'รายละเอียดสาขา'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.name?.trim() && formData.code?.trim()) ? 1 : 0.5 }} disabled={!formData.name?.trim() || !formData.code?.trim()}>{modalMode === 'add' ? 'บันทึกสาขา' : 'บันทึกการแก้ไข'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        <div>
                            <label style={crudStyles.label}>รหัสสาขา <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="text" style={crudStyles.input} placeholder="เช่น HQ01" value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value})} disabled={modalMode === 'view'} />
                        </div>
                        <div>
                            <label style={crudStyles.label}>ชื่อสาขา <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="text" style={crudStyles.input} placeholder="ระบุชื่อสาขา" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={modalMode === 'view'} />
                        </div>
                    </div>
                    <div>
                        <label style={crudStyles.label}>ผู้จัดการสาขา</label>
                        <input type="text" style={crudStyles.input} placeholder="ชื่อ-นามสกุล" value={formData.manager || ''} onChange={(e) => setFormData({...formData, manager: e.target.value})} disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>เบอร์ติดต่อ</label>
                        <input type="tel" style={crudStyles.input} placeholder="02-XXX-XXXX" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={modalMode === 'view'} />
                    </div>
                    {modalMode !== 'add' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.status || false} onChange={(val) => { if (modalMode !== 'view') setFormData({...formData, status: val}); }} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

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
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบสาขา <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

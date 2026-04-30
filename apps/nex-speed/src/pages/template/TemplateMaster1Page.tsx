import React, { useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';

export default function TemplateMaster1Page() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [dummyData, setDummyData] = useState(
        Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: i === 0 ? 'มาตรฐานแบบที่ 1 (Pattern 1)' : i === 1 ? 'เหมาะสำหรับหน้าอะไร?' : i === 2 ? 'ส่วนประกอบหลัก' : `มาตรฐานบัญชีรายการที่ ${i + 1}`,
            desc: i === 0 ? 'หน้านี้คือโครงสร้างที่ไม่มีกล่องด้านบน' : i === 1 ? 'ใช้งานสำหรับตารางข้อมูลพื้นฐาน เช่น หน้าหน่วยนับ, สถานะ, ฯลฯ' : i === 2 ? 'มี แถบค้นหา ปุ่มเพิ่ม ตาราง และ ระบบแบ่งหน้า (Pagination)' : `คำอธิบายข้อมูลสำหรับรายการตัวอย่างที่ ${i + 1} ในระบบ`,
            status: i !== 2 && i % 4 !== 0
        }))
    );
    const [pageSize, setPageSize] = useState(15);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', desc: '', status: true });

    // Action Handlers
    const handleAdd = () => {
        setFormData({ name: '', desc: '', status: true });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setFormData({ name: item.name, desc: item.desc, status: item.status });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setFormData({ name: item.name, desc: item.desc, status: item.status });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: any) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = () => {
        if (!formData.name.trim()) return; // Simple validation
        if (modalMode === 'add') {
            const newId = dummyData.length > 0 ? Math.max(...dummyData.map(d => d.id)) + 1 : 1;
            setDummyData([{ id: newId, ...formData }, ...dummyData]);
            setIsModalOpen(false);
        } else if (modalMode === 'edit') {
            setDummyData(prev => prev.map(d => d.id === selectedItem.id ? { ...d, ...formData } : d));
            setIsModalOpen(false);
        }
    };

    const confirmDelete = () => {
        setDummyData(prev => prev.filter(d => d.id !== selectedItem.id));
        setIsModalOpen(false);
    };
    
    // กรองข้อมูลตามคำค้นหา
    const searchLower = search.toLowerCase();
    const filteredData = dummyData.filter(item => 
        !searchLower || 
        item.name.toLowerCase().includes(searchLower) || 
        item.desc.toLowerCase().includes(searchLower)
    );

    // คำนวณข้อมูลที่จะนำมาแสดงในตาราง (Data Slicing)
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout
            // -----------------------------------------
            // ข้ามการใส่ summaryCards เพื่อให้ได้ Layout 1
            // -----------------------------------------
            
            // แถบซ้าย - ปุ่ม Export หรือ ฟังก์ชันอื่นๆ
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Template1', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Template1', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Template1', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ], 'Template 1 Report')}
                />
            }

            // แถบขวา - การค้นหา และ เพิ่มรายการ
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาตัวอย่าง..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            {/* ตารางข้อมูล - บังคับความสูงตายตัวที่ 720px */}
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>ชื่อข้อมูล</th>
                        <th>คำอธิบาย</th>
                        <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id}>
                            <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {item.id}</td>
                            <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.name}</span></td>
                            <td className="text-muted">{item.desc}</td>
                            <td className="text-center">
                                <StatusDropdown 
                                    status={item.status} 
                                    onChange={(val) => {
                                        setDummyData(prev => prev.map(d => d.id === item.id ? { ...d, status: val } : d));
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
                    {dummyData.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
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
                isOpen={isModalOpen && modalMode !== 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มข้อมูลใหม่' : modalMode === 'edit' ? 'แก้ไขข้อมูล' : 'รายละเอียดข้อมูล'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: formData.name.trim() ? 1 : 0.5 }}  disabled={!formData.name.trim()}>{modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อข้อมูล <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="ระบุชื่อข้อมูล"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>คำอธิบาย</label>
                        <textarea 
                            style={{...crudStyles.input, minHeight: '100px', resize: 'vertical'}} 
                            placeholder="ระบุคำอธิบาย หรือหมายเหตุ"
                            value={formData.desc}
                            onChange={(e) => setFormData({...formData, desc: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    {modalMode !== 'add' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown 
                                    status={formData.status} 
                                    onChange={(val) => {
                                        if (modalMode !== 'view') setFormData({...formData, status: val});
                                    }} 
                                />
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
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

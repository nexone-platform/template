import os

PAGES_DIR = "c:/Task/Nex Solution/nex-speed/frontend/src/pages"

PAGES = [
    {
        "file": "MechanicTypePage.tsx",
        "entity": "MechanicType",
        "title": "ประเภทช่างซ่อม",
        "apiMethod": "MechanicType"
    },
    {
        "file": "UnitTypePage.tsx",
        "entity": "UnitType",
        "title": "หน่วยนับ",
        "apiMethod": "UnitType"
    },
    {
        "file": "LiquidTypePage.tsx",
        "entity": "LiquidType",
        "title": "ประเภทของเหลว",
        "apiMethod": "LiquidType"
    },
    {
        "file": "PartGroupPage.tsx",
        "entity": "PartGroup",
        "title": "กลุ่มอะไหล่",
        "apiMethod": "PartGroup"
    },
    {
        "file": "StorageTypePage.tsx",
        "entity": "StorageType",
        "title": "ประเภทคลัง/สถานที่",
        "apiMethod": "StorageType"
    },
    {
        "file": "ParkingTypePage.tsx",
        "entity": "ParkingType",
        "title": "ประเภทที่จอดรถ",
        "apiMethod": "ParkingType"
    }
]

TEMPLATE = """'use client';

import React, { useState, useEffect } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal } from '@/components/CrudComponents';
import StatusDropdown from '@/components/StatusDropdown';
import Pagination from '@/components/Pagination';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { api, [[ENTITY]] as API[[ENTITY]] } from '@/services/api';

export default function [[ENTITY]]Page() {
    const [data, setData] = useState<API[[ENTITY]][]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<API[[ENTITY]] | null>(null);
    const [formData, setFormData] = useState<Partial<API[[ENTITY]]>>({ name: '', description: '', status: 'active' });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const loadData = () => {
        api.get[[APIMETHOD]]s().then(res => setData((res || []) as unknown as API[[ENTITY]][])).catch(() => setData([]));
    };
    useEffect(() => { loadData(); }, []);

    // Action Handlers
    const handleAdd = () => {
        setFormData({ name: '', description: '', status: 'active' });
        setFormErrors({});
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: API[[ENTITY]]) => {
        setFormData({ name: item.name, description: item.description, status: item.status });
        setSelectedItem(item);
        setFormErrors({});
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: API[[ENTITY]]) => {
        setFormData({ name: item.name, description: item.description, status: item.status });
        setSelectedItem(item);
        setFormErrors({});
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: API[[ENTITY]]) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        const errors: { [key: string]: string } = {};
        if (!formData.name || !formData.name.trim()) errors.name = 'กรุณาระบุข้อมูล';
        else {
            const dup = data.find(x => x.name.trim() === formData.name!.trim() && (!selectedItem || x.id !== selectedItem.id));
            if (dup) errors.name = 'รหัสหรือชื่อนี้มีอยู่แล้วในระบบ';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (modalMode === 'add') {
                await api.create[[APIMETHOD]]({ name: formData.name!, description: formData.description || '', status: formData.status || 'active' });
            } else if (modalMode === 'edit' && selectedItem) {
                await api.update[[APIMETHOD]](selectedItem.id, { name: formData.name!, description: formData.description || '', status: formData.status || 'active' });
            }
            loadData();
            setIsModalOpen(false);
        } catch (e) { console.error(e); }
    };

    const confirmDelete = async () => {
        try {
            if (selectedItem) { await api.delete[[APIMETHOD]](selectedItem.id); loadData(); }
        } catch (e) { console.error(e); }
        setIsModalOpen(false);
    };

    // Filter Data
    const searchLower = search.toLowerCase();
    const filteredData = data.filter(item => 
        !searchLower || 
        item.name.toLowerCase().includes(searchLower) || 
        (item.description && item.description.toLowerCase().includes(searchLower))
    );

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <CrudLayout
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา[[TITLE]]..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> <span>เพิ่มข้อมูล</span>
                    </button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>ID</th>
                            <th>ชื่อ[[TITLE]]</th>
                            <th>คำอธิบาย</th>
                            <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={item.id}>
                                <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {index + 1 + (safePage - 1) * pageSize}</td>
                                <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.name}</span></td>
                                <td className="text-muted">{item.description || '-'}</td>
                                <td className="text-center">
                                    <StatusDropdown 
                                        value={item.status}
                                        onChange={async (val: any) => { 
                                            setData(prev => prev.map(x => x.id === item.id ? { ...x, status: val } : x));
                                            try { await api.update[[APIMETHOD]](item.id, { ...item, status: val } as any); } catch(err){}
                                        }}
                                        options={[
                                            { value: 'active', label: 'ใช้งาน', color: 'green' },
                                            { value: 'inactive', label: 'ระงับ', color: 'red' }
                                        ]}
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
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                    ไม่พบข้อมูล
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

            <BaseModal 
                isOpen={isModalOpen && modalMode !== 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่ม[[TITLE]]' : modalMode === 'edit' ? 'แก้ไข[[TITLE]]' : 'รายละเอียด[[TITLE]]'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: formData.name?.trim() ? 1 : 0.5 }} disabled={!formData.name?.trim()}>บันทึกข้อมูล</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อ[[TITLE]] <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={{ ...crudStyles.input, borderColor: formErrors.name ? '#ef4444' : 'var(--border-color)' }} 
                            placeholder="ระบุชื่อ[[TITLE]]"
                            value={formData.name || ''}
                            onChange={(e) => {
                                setFormData({...formData, name: e.target.value});
                                if (formErrors.name) setFormErrors({...formErrors, name: ''});
                            }}
                            disabled={modalMode === 'view'}
                        />
                        {formErrors.name && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{formErrors.name}</div>}
                    </div>
                    <div>
                        <label style={crudStyles.label}>คำอธิบาย</label>
                        <textarea 
                            style={{...crudStyles.input, minHeight: '100px', resize: 'vertical'}} 
                            placeholder="ระบุคำอธิบาย หรือหมายเหตุ"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    {modalMode !== 'add' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select 
                                    style={crudStyles.input} 
                                    value={formData.status} 
                                    onChange={e => {
                                        if (modalMode !== 'view') setFormData({ ...formData, status: e.target.value });
                                    }}
                                    disabled={modalMode === 'view'}
                                >
                                    <option value="active">✅ ใช้งาน</option>
                                    <option value="inactive">❌ ระงับ</option>
                                </select>
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
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
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
"""

for page in PAGES:
    filepath = os.path.join(PAGES_DIR, page['file'])
    content = TEMPLATE.replace('[[ENTITY]]', page['entity']).replace('[[TITLE]]', page['title']).replace('[[APIMETHOD]]', page['apiMethod'])
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {page['file']}")

import React, { useEffect,  useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Tags, Box, ShieldCheck, Download, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useSystemConfig } from '@nexone/ui';

export default function TemplateMaster2Page() {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [dummyData, setDummyData] = useState(
        Array.from({ length: 32 }, (_, i) => ({
            id: i + 1,
            name: i === 0 ? 'มาตรฐานแบบที่ 2 (Pattern 2)' : i === 1 ? 'เปลี่ยน Layout ง่ายๆ' : i === 2 ? 'Export บาร์ฝั่งซ้าย' : `รายการคำสั่งซื้อคลังสินค้าที่ ${i + 1}`,
            category: i === 0 ? 'หมวดหมู่หลัก' : i === 1 ? 'หมวดหมู่ย่อย' : i === 2 ? 'สถานะพิเศษ' : i % 3 === 0 ? 'หมวดหมู่หลัก' : 'หมวดหมู่ย่อย',
            desc: i === 0 ? 'มีส่วนประกอบของกล่องตัวเลขสถิติด้านบน' : i === 1 ? 'เพียงแค่ใส่ props summaryCards ใน CrudLayout' : i === 2 ? 'สามารถเติมเนื้อหาในฝั่งซ้าย toolbarLeft ได้' : `ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ ${i + 1}`,
            status: i !== 2 && i % 5 !== 0
        }))
    );
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 15);
    const [categories, setCategories] = useState<string[]>(['หมวดหมู่หลัก', 'หมวดหมู่ย่อย', 'สถานะพิเศษ', 'หมวดหมู่อื่นๆ']);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', category: 'หมวดหมู่หลัก', desc: '', status: true });
    
    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Action Handlers
    const handleAdd = () => {
        setFormData({ name: '', category: 'หมวดหมู่หลัก', desc: '', status: true });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setFormData({ name: item.name, category: item.category, desc: item.desc, status: item.status });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setFormData({ name: item.name, category: item.category, desc: item.desc, status: item.status });
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
        if (!formData.name.trim() || !formData.category.trim()) return; 
        if (modalMode === 'add') {
            const newId = dummyData.length > 0 ? Math.max(...dummyData.map(d => d.id)) + 1 : 1;
            setDummyData(prev => [{ id: newId, ...formData }, ...prev]);
        } else if (modalMode === 'edit') {
            setDummyData(prev => prev.map(d => d.id === selectedItem.id ? { ...d, ...formData } : d));
        }
        setIsModalOpen(false);
    };

    const confirmDelete = () => {
        setDummyData(prev => prev.filter(d => d.id !== selectedItem.id));
        setIsModalOpen(false);
    };

    const handleSaveCategory = () => {
        if (!newCategoryName.trim()) return;
        if (!categories.includes(newCategoryName.trim())) {
            setCategories(prev => [...prev, newCategoryName.trim()]);
            setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
        }
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
    };

    // กรองข้อมูลตามคำค้นหา (Search)
    const searchLower = search.toLowerCase();
    const baseData = dummyData.filter(item => 
        !searchLower || 
        item.name.toLowerCase().includes(searchLower) || 
        item.desc.toLowerCase().includes(searchLower)
    );

    // ดึงรายการหมวดหมู่ทั้งหมดที่ไม่ซ้ำกัน
    const uniqueCategories = Array.from(new Set(dummyData.map(item => item.category)));

    // กรองข้อมูลตามแท็บด้านบน (Summary Cards)
    const filteredData = baseData.filter(item => {
        if (filterType === 'all') return true;
        return item.category === filterType;
    });

    // คำนวณข้อมูลที่จะนำมาแสดงในตาราง (Data Slicing)
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout
            // -----------------------------------------
            // แบบที่ 2: ใส่ summaryCards เพื่อให้สร้างช่องด้านบน
            // -----------------------------------------
            summaryCards={
                <>
                    <SummaryCard 
                        title="รายการทั้งหมด" 
                        count={baseData.length} 
                        icon={<Tags size={22} />} 
                        color="#3b82f6"     // สีฟ้า
                        isActive={filterType === 'all'} 
                        onClick={() => { setFilterType('all'); setCurrentPage(1); }} 
                    />
                    {uniqueCategories.map((category, index) => {
                        const count = baseData.filter(i => i.category === category).length;
                        const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                        const color = colors[index % colors.length];
                        return (
                            <SummaryCard 
                                key={category}
                                title={category} 
                                count={count} 
                                icon={<Box size={22} />} 
                                color={color}
                                isActive={filterType === category} 
                                onClick={() => { setFilterType(category); setCurrentPage(1); }} 
                            />
                        );
                    })}
                </>
            }

            // แถบซ้าย - ปุ่ม Export หรือ ฟังก์ชันอื่นๆ (จะอยู่ตรงข้ามแบบขนานกับปุ่มค้นหา)
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Template2', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'หัวข้อ' },
                        { key: 'category', label: 'หมวดหมู่' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Template2', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'หัวข้อ' },
                        { key: 'category', label: 'หมวดหมู่' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Template2', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'หัวข้อ' },
                        { key: 'category', label: 'หมวดหมู่' },
                        { key: 'desc', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ], 'Template 2 Report')}
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
            {/* ตารางข้อมูล - บังคับความสูงตายตัวที่ 600px เพื่อเว้นที่ให้กล่องด้านบน */}
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>หัวข้อ</th>
                        <th>หมวดหมู่</th>
                        <th>อธิบายการใช้งาน</th>
                        <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id}>
                            <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)' }}># {item.id}</td>
                            <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.name}</span></td>
                            <td className="text-muted text-small">{item.category}</td>
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
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (formData.name.trim() && formData.category.trim()) ? 1 : 0.5 }}  disabled={!formData.name.trim() || !formData.category.trim()}>{modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>หัวข้อ <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="ระบุชื่อหัวข้อ"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...crudStyles.label, marginBottom: 0 }}>หมวดหมู่ <span style={{color: '#ef4444'}}>*</span></label>
                            {modalMode !== 'view' && (
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                    <Plus size={14} /> <span>เพิ่มหมวดหมู่</span>
                                </button>
                            )}
                        </div>
                        <select 
                            style={{...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer'}} 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            disabled={modalMode === 'view'}
                        >
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={crudStyles.label}>อธิบายการใช้งาน</label>
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

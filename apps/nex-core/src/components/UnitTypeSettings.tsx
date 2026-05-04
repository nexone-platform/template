import { useSystemConfig } from '@nexone/ui';
import React, { useEffect,  useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal } from '@/components/CrudComponents';
import { Plus, Edit2, Trash2, Box, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useApiConfig } from '../contexts/ApiConfigContext';

interface UnitType {
  id: string;
  name: string;
  symbol: string;
  group: string;
  status: boolean;
}

export default function UnitTypeSettings() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { configs, loading: configLoading } = useSystemConfig();
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [data, setData] = useState<UnitType[]>([]);
    
    // Fetch data from API
    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const API_URL = `${coreApi}/unit-types`;

    const fetchUnitTypes = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                const formattedList = json.map((p: any) => ({
                    id: String(p.id),
                    name: p.name || '',
                    symbol: p.symbol || '',
                    group: p.group || p.description || '',
                    status: p.status ?? true
                }));
                setData(formattedList);
            }
        } catch (e) {
            console.error('Failed to fetch unit types', e);
        }
    };

    useEffect(() => {
        fetchUnitTypes();
    }, []);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'delete'|'view'>('add');
    const [selectedItem, setSelectedItem] = useState<UnitType | null>(null);
    const [formData, setFormData] = useState<Partial<UnitType>>({ name: '', symbol: '', group: '', status: true });

    // Action Handlers
    const handleAdd = () => {
        setFormData({ name: '', symbol: '', group: '', status: true });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleView = (item: UnitType) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEdit = (item: UnitType) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (item: UnitType) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.name?.trim()) return;
        const payload = {
            name: formData.name,
            symbol: formData.symbol,
            description: formData.group, // map group to description in DB
            status: formData.status ?? true,
        };

        if (modalMode === 'add') {
            await fetch(API_URL, { credentials: 'include', 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            await fetchUnitTypes();
            setIsModalOpen(false);
        } else if (modalMode === 'edit' && selectedItem) {
            await fetch(`${API_URL}/${selectedItem.id}`, { credentials: 'include', 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            await fetchUnitTypes();
            setIsModalOpen(false);
        }
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            await fetch(`${API_URL}/${selectedItem.id}`, { credentials: 'include',  method: 'DELETE' });
            await fetchUnitTypes();
            setIsModalOpen(false);
        }
    };

    // Filter
    const searchLower = search.toLowerCase();
    const filteredData = data.filter(item => 
        !searchLower || 
        item.name.toLowerCase().includes(searchLower) || 
        item.symbol.toLowerCase().includes(searchLower) ||
        item.group.toLowerCase().includes(searchLower)
    );

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <CrudLayout
            toolbarLeft={
                <div className="flex items-center gap-3">
                     <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Box size={22} className="text-blue-600" /> จัดการข้อมูลหน่วยนับ (Unit Types)
                     </span>
                </div>
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาหน่วยนับ..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มหน่วยนับ</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ชื่อหน่วยนับ</th>
                            <th>สัญลักษณ์ (Symbol)</th>
                            <th>กลุ่ม (Group)</th>
                            <th className="text-center" style={{ width: '120px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.id}>
                                <td className="font-semibold text-slate-700">{item.name}</td>
                                <td>{item.symbol}</td>
                                <td><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded font-medium text-xs">{item.group}</span></td>
                                <td className="text-center">
                                    <StatusDropdown 
                                        status={item.status} 
                                        onChange={async (val) => {
                                            // Optimistic update — เปลี่ยน UI ทันที
                                            setData(prev => prev.map(d => d.id === item.id ? { ...d, status: val } : d));
                                            try {
                                                await fetch(`${API_URL}/${item.id}`, { credentials: 'include', 
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: val })
                                                });
                                            } catch (e) {
                                                // ถ้า API ล้มเหลว rollback กลับ
                                                console.error('Status update failed:', e);
                                                setData(prev => prev.map(d => d.id === item.id ? { ...d, status: !val } : d));
                                            }
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
                title={modalMode === 'add' ? 'เพิ่มหน่วยนับ' : modalMode === 'edit' ? 'แก้ไขหน่วยนับ' : 'รายละเอียดหน่วยนับ'}
                footer={
                    modalMode === 'view' ? (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    ) : (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: formData.name?.trim() ? 1 : 0.5 }} disabled={!formData.name?.trim()}>{modalMode === 'add' ? 'เพิ่ม' : 'บันทึก'}</button>
                        </>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อหน่วยนับ <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="text" style={crudStyles.input} value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="เช่น กิโลกรัม" disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>สัญลักษณ์ (Symbol)</label>
                        <input type="text" style={crudStyles.input} value={formData.symbol || ''} onChange={(e) => setFormData({...formData, symbol: e.target.value})} placeholder="เช่น kg" disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>หมวดหมู่</label>
                        <input type="text" style={crudStyles.input} value={formData.group || ''} onChange={(e) => setFormData({...formData, group: e.target.value})} placeholder="เช่น น้ำหนัก, ปริมาตร" disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown 
                                    status={formData.status ?? true} 
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({...formData, status: val}); }} 
                                    disabled={modalMode === 'view'} 
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
                title="ยืนยันการลบ"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <p>ต้องการลบข้อมูล <strong>{selectedItem?.name}</strong> ใช่หรือไม่?</p>
            </BaseModal>
        </CrudLayout>
    );
}

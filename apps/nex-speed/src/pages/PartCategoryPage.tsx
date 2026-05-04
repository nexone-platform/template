'use client';

import React, { useState, useEffect } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Tags, Hash, Plus, X, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { api, PartCategory as APIPartCategory, PartGroup } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, ExportButtons, SearchInput, BaseModal, crudStyles } from '@/components/CrudComponents';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';
import Pagination from '@/components/Pagination';
import { useSystemConfig } from '@nexone/ui';

interface PartCategory {
    id: number;
    name: string;
    description: string;
    status: string;
    partGroupId?: number | null;
    partGroupName?: string;
    createdAt?: string;
}

const groupColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

export default function PartCategoryPage() {
    const [data, setData] = useState<PartCategory[]>([]);
    const [groups, setGroups] = useState<PartGroup[]>([]);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState<'all' | number>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [selected, setSelected] = useState<PartCategory | null>(null);
    const [form, setForm] = useState<Partial<PartCategory>>({ name: '', description: '', status: 'active', partGroupId: null });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Inline Part Group Create
    const [groupModal, setGroupModal] = useState(false);
    const [groupForm, setGroupForm] = useState<Partial<PartGroup>>({ name: '', description: '', status: 'active' });

    const loadData = () => {
        api.getPartCategories().then(res => setData((res || []) as unknown as PartCategory[])).catch(() => setData([]));
        api.getPartGroups().then(res => setGroups(res || [])).catch(() => setGroups([]));
    };
    useEffect(() => { loadData(); }, []);

    const filtered = data.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
        const matchGroup = groupFilter === 'all' || r.partGroupId === groupFilter;
        return matchSearch && matchGroup;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleSave = async () => {
        const errors: { [key: string]: string } = {};
        if (!form.name || !form.name!.trim()) errors.name = 'กรุณาระบุข้อมูล';
        else {
            const dup = data.find(x => x.name.trim() === form.name!.trim() && (!selected || x.id !== selected.id));
            if (dup) errors.name = 'รหัสหรือชื่อนี้มีอยู่แล้วในระบบ';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const payload = { 
                name: form.name, 
                description: form.description, 
                status: form.status, 
                partGroupId: form.partGroupId ? Number(form.partGroupId) : undefined 
            };
            if (modal === 'add') {
                await api.createPartCategory(payload);
            } else if (modal === 'edit' && selected) {
                await api.updatePartCategory(selected.id, payload);
            }
            loadData();
        } catch (e) { console.error(e); }
        setModal(null);
    };

    const handleDelete = async () => {
        try {
            if (selected) { await api.deletePartCategory(selected.id); loadData(); }
        } catch (e) { console.error(e); }
        setModal(null);
    };

    const handleSaveGroup = async () => {
        if (!groupForm.name || !groupForm.name.trim()) return;
        try {
            await api.createPartGroup({ 
                name: groupForm.name, 
                description: groupForm.description, 
                status: groupForm.status 
            } as any);
            await api.getPartGroups().then((res: any) => setGroups(res || [])).catch(() => setGroups([]));
            setGroupModal(false);
        } catch (e) { console.error(e); }
    };

    const lblStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' };
    
    // Export Configurations
    const exportConfigs = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'ชื่อหมวดหมู่อะไหล่' },
        { key: 'partGroupName', label: 'กลุ่มอะไหล่', format: (val: any) => val.partGroupName || '-' },
        { key: 'description', label: 'คำอธิบาย' },
        { key: 'status', label: 'สถานะ', format: (val: any) => val.status === 'active' ? 'ใช้งาน' : 'เลิกใช้งาน' }
    ];

    return (
        <>
            <CrudLayout
                summaryCards={
                    <>
                        <SummaryCard 
                            title="ทั้งหมด" 
                            count={data.length} 
                            icon={<Tags size={22} />} 
                            color="#3b82f6"
                            onClick={() => { setGroupFilter('all'); setCurrentPage(1); }}
                            isActive={groupFilter === 'all'}
                        />
                        {groups.map((g, idx) => {
                            const count = data.filter(d => d.partGroupId === g.id).length;
                            const cHex = groupColors[idx % groupColors.length];
                            return (
                                <SummaryCard
                                    key={g.id}
                                    title={g.name}
                                    count={count}
                                    icon={<Tags size={22} />}
                                    color={cHex}
                                    onClick={() => { setGroupFilter(g.id); setCurrentPage(1); }}
                                    isActive={groupFilter === g.id}
                                />
                            );
                        })}
                    </>
                }
                toolbarLeft={
                    <ExportButtons 
                        onExportXLSX={() => exportToXLSX(filtered, 'PartCategory', exportConfigs)}
                        onExportCSV={() => exportToCSV(filtered, 'PartCategory', exportConfigs)}
                        onExportPDF={() => exportToPDF(filtered, 'PartCategory', exportConfigs, 'รายงานหมวดหมู่อะไหล่')}
                    />
                }
                toolbarRight={
                    <>
                        <SearchInput 
                            value={search} 
                            onChange={setSearch} 
                            placeholder="ค้นหาหมวดหมู่อะไหล่..." 
                        />
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setForm({ name: '', description: '', status: 'active', partGroupId: null }); setFormErrors({}); setModal('add'); }}>
                            <Plus size={16} /> <span>สร้างหมวดหมู่ใหม่</span>
                        </button>
                    </>
                }
            >
                <div style={{ height: '600px', overflowY: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>ชื่อหมวดหมู่อะไหล่</th>
                                <th>กลุ่มอะไหล่</th>
                                <th>คำอธิบาย</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>สถานะ</th>
                                <th style={{ textAlign: 'center', width: '120px', paddingRight: '24px' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((r, i) => (
                                <tr key={r.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12}/>{(safePage - 1) * pageSize + i + 1}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Tags size={14} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{r.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '13px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                                            {r.partGroupName || '-'}
                                        </span>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{r.description || '-'}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <StatusDropdown 
                                            value={r.status}
                                            onChange={async (newValue: any) => {
                                                setData(prev => prev.map(x => x.id === r.id ? { ...x, status: newValue } : x));
                                                try { await api.updatePartCategory(r.id, { ...r, status: newValue } as any); } catch(err){}
                                            }}
                                            options={[
                                                { value: 'active', label: 'ใช้งาน', color: 'green' },
                                                { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' }
                                            ]}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', paddingRight: '24px' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <button title="เรียกดู" style={crudStyles.viewBtn} onClick={() => { setSelected(r); setModal('view'); }}><Eye size={15} /></button>
                                            <button title="แก้ไข" style={crudStyles.editBtn} onClick={() => { setSelected(r); setForm({ ...r }); setFormErrors({}); setModal('edit'); }}><Pencil size={15} /></button>
                                            <button title="ลบ" style={crudStyles.deleteBtn} onClick={() => { setSelected(r); setModal('delete'); }}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <Search size={32} style={{ opacity: 0.5 }} />
                                            <span>ไม่พบข้อมูลหมวดหมู่อะไหล่</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage} pageSize={pageSize} totalItems={filtered.length}
                    setCurrentPage={setCurrentPage} setPageSize={setPageSize}
                />
            </CrudLayout>

            <BaseModal
                isOpen={modal !== null}
                onClose={() => setModal(null)}
                title={modal === 'add' ? 'เพิ่มหมวดหมู่อะไหล่' : modal === 'edit' ? `แก้ไข: ${selected?.name}` : modal === 'view' ? 'ข้อมูลหมวดหมู่อะไหล่' : 'ยืนยันการลบ'}
                width={modal === 'view' ? '400px' : '520px'}
                footer={
                    modal === 'view' ? (
                        <button className="crud-btn-secondary" onClick={() => setModal(null)}>ปิด</button>
                    ) : modal === 'delete' ? (
                        <>
                            <button className="crud-btn-secondary" onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button className="crud-btn-danger" onClick={handleDelete}>ยืนยันการลบ</button>
                        </>
                    ) : (
                        <>
                            <button className="crud-btn-secondary" onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button className="crud-btn-primary" onClick={handleSave} disabled={!form.name} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                {modal === 'edit' ? 'บันทึกข้อมูล' : 'เพิ่มข้อมูล'}
                            </button>
                        </>
                    )
                }
            >
                {modal === 'view' && selected && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div><div style={{...lblStyle, marginBottom: '2px'}}>ID</div><div style={{fontWeight: 500}}>{selected.id}</div></div>
                        <div><div style={{...lblStyle, marginBottom: '2px'}}>ชื่อหมวดหมู่</div><div style={{fontWeight: 500}}>{selected.name}</div></div>
                        <div><div style={{...lblStyle, marginBottom: '2px'}}>กลุ่มอะไหล่</div><div style={{fontWeight: 500}}>{selected.partGroupName || '-'}</div></div>
                        <div><div style={{...lblStyle, marginBottom: '2px'}}>คำอธิบาย</div><div style={{fontWeight: 500}}>{selected.description || '-'}</div></div>
                        <div><div style={{...lblStyle, marginBottom: '2px'}}>สถานะ</div><div style={{fontWeight: 500}}>{selected.status === 'active' ? 'ใช้งาน' : 'เลิกใช้งาน'}</div></div>
                    </div>
                )}
                
                {(modal === 'add' || modal === 'edit') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div>
                            <label style={lblStyle}>ชื่อหมวดหมู่อะไหล่ <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                                style={{ ...inputStyle, borderColor: formErrors.name ? '#ef4444' : 'var(--border-color)' }}
                                value={form.name || ''} 
                                onChange={e => { setForm({ ...form, name: e.target.value }); if(formErrors.name) setFormErrors({...formErrors, name: ''}); }} 
                                placeholder="เช่น ระบบเครื่องยนต์" 
                            />
                            {formErrors.name && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.name}</div>}
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{...lblStyle, marginBottom: 0}}>กลุ่มอะไหล่ (Group)</label>
                                <button 
                                    className="btn btn-sm" 
                                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 500 }}
                                    onClick={() => {
                                        setGroupForm({ name: '', description: '', status: 'active' });
                                        setGroupModal(true);
                                    }}
                                >
                                    <Plus size={14} /> เพิ่มกลุ่มอะไหล่
                                </button>
                            </div>
                            <select style={inputStyle} value={form.partGroupId || ''} onChange={e => setForm({ ...form, partGroupId: Number(e.target.value) || null })}>
                                <option value="">-- ไม่ระบุกลุ่ม --</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={lblStyle}>คำอธิบาย</label>
                            <textarea 
                                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                                value={form.description || ''} 
                                onChange={e => setForm({ ...form, description: e.target.value })} 
                                placeholder="ระบุรายละเอียดเพิ่มเติม..." 
                            />
                        </div>
                        <div>
                            <label style={lblStyle}>สถานะ</label>
                            <select style={inputStyle} value={form.status || 'active'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="active">ใช้งาน</option>
                                <option value="inactive">เลิกใช้งาน</option>
                            </select>
                        </div>
                    </div>
                )}
                
                {modal === 'delete' && selected && (
                    <div>
                        <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
                            คุณต้องการลบข้อมูล <strong>{selected.name || 'รายการนี้'}</strong> ใช่หรือไม่?
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px' }}>
                            * การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากระบบอย่างถาวร
                        </p>
                    </div>
                )}
            </BaseModal>

            {/* Inline Group Modal */}
            <BaseModal
                isOpen={groupModal}
                onClose={() => setGroupModal(false)}
                title="เพิ่มกลุ่มอะไหล่"
                width="450px"
                footer={
                    <>
                        <button className="crud-btn-secondary" onClick={() => setGroupModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={handleSaveGroup} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="crud-btn-primary" disabled={!groupForm.name}>{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                        <label style={lblStyle}>ชื่อกลุ่มอะไหล่ <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            style={inputStyle} 
                            value={groupForm.name || ''} 
                            onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} 
                            placeholder="เช่น คลังสินค้าควบคุมอุณหภูมิ" 
                        />
                    </div>
                    <div>
                        <label style={lblStyle}>คำอธิบาย</label>
                        <textarea 
                            style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                            value={groupForm.description || ''} 
                            onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} 
                            placeholder="ระบุรายละเอียดเพิ่มเติม..." 
                        />
                    </div>
                    <div>
                        <label style={lblStyle}>สถานะ</label>
                        <select style={inputStyle} value={groupForm.status || 'active'} onChange={e => setGroupForm({...groupForm, status: e.target.value})}>
                            <option value="active">ใช้งาน</option>
                            <option value="inactive">เลิกใช้งาน</option>
                        </select>
                    </div>
                </div>
            </BaseModal>
        </>
    );
}

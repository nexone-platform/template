'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { api, MechanicExpertise } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, ExportButtons, SearchInput, BaseModal, crudStyles } from '@/components/CrudComponents';
import StatusDropdown from '@/components/StatusDropdown';
import Pagination from '@/components/Pagination';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';

const TYPE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const TYPE_ICONS = ['🚗', '📦', '🏗️', '🚜', '🛻', '🚙', '🔧'];
const getTypeStyle = (type: string, allTypes: string[]) => {
    const idx = allTypes.indexOf(type);
    const color = idx >= 0 ? TYPE_COLORS[idx % TYPE_COLORS.length] : '#8b5cf6';
    const icon = idx >= 0 ? TYPE_ICONS[idx % TYPE_ICONS.length] : '🔧';
    return { color, icon };
};

interface ExpertiseItem {
    id: number;
    name: string;
    mechanicType: string;
    description: string;
    status: string;
    createdAt?: string;
}

const exportConfigs = [
    { label: 'ชื่อความชำนาญ', key: 'name' },
    { label: 'ประเภทช่าง', key: 'mechanicType' },
    { label: 'คำอธิบาย', key: 'description' },
    { label: 'สถานะ', key: 'status', format: (v: any) => v.status === 'active' ? 'ใช้งาน' : 'ระงับ' }
];

export default function ExpertisePage() {
    const [data, setData] = useState<ExpertiseItem[]>([]);
    const [mechanicTypes, setMechanicTypes] = useState<string[]>(['ช่างซ่อมรถยนต์', 'ช่างซ่อมตู้คอนเทนเนอร์']);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [selected, setSelected] = useState<ExpertiseItem | null>(null);
    const [form, setForm] = useState<Partial<ExpertiseItem>>({ name: '', mechanicType: '', description: '', status: 'active' });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [pageSize, setPageSize] = useState(10);

    const loadData = async () => {
        try {
            const res = await api.getMechanicExpertise().catch(() => null);
            if (res && res.length > 0) setData(res as unknown as ExpertiseItem[]);
            else setData([]);

            const typesRes = await api.getMechanicTypes().catch(() => null);
            if (typesRes && typesRes.length > 0) {
                setMechanicTypes(typesRes.filter((t: any) => t.status === 'active' || t.status === 'ใช้งาน').map((t: any) => t.name));
            }
        } catch {
            setData([]);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = data.filter(r => {
        const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || r.mechanicType === filterType;
        return matchSearch && matchType;
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
            if (modal === 'add') {
                await api.createMechanicExpertise({ name: form.name, mechanicType: form.mechanicType, description: form.description, status: form.status });
            } else if (modal === 'edit' && selected) {
                await api.updateMechanicExpertise(selected.id, { name: form.name, mechanicType: form.mechanicType, description: form.description, status: form.status });
            }
            loadData();
        } catch (e) { console.error(e); }
        setModal(null);
    };

    const handleDelete = async () => {
        try {
            if (selected) { await api.deleteMechanicExpertise(selected.id); loadData(); }
        } catch (e) { console.error(e); }
        setModal(null);
    };

    const handleExportXLSX = () => exportToXLSX(filtered.map((item, i) => ({ ...item, index: i + 1 })), 'Expertise', [{ label: 'ลำดับ', key: 'index' }, ...exportConfigs]);
    const handleExportCSV = () => exportToCSV(filtered.map((item, i) => ({ ...item, index: i + 1 })), 'Expertise', [{ label: 'ลำดับ', key: 'index' }, ...exportConfigs]);
    const handleExportPDF = () => exportToPDF(filtered.map((item, i) => ({ ...item, index: i + 1 })), 'Expertise', [{ label: 'ลำดับ', key: 'index' }, ...exportConfigs], 'รายงานความชำนาญช่าง');

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard 
                        title="ความชำนาญทั้งหมด" 
                        count={data.length} 
                        icon={<Tags size={22} />} 
                        color="#3b82f6"
                        isActive={filterType === 'all'} 
                        onClick={() => { setFilterType('all'); setCurrentPage(1); }} 
                    />
                    {mechanicTypes.map(t => {
                        const count = data.filter(x => x.mechanicType === t).length;
                        const { color, icon } = getTypeStyle(t, mechanicTypes);
                        return (
                            <SummaryCard 
                                key={t}
                                title={t} 
                                count={count} 
                                icon={<span style={{ fontSize: '20px' }}>{icon}</span>} 
                                color={color}
                                isActive={filterType === t} 
                                onClick={() => { setFilterType(t); setCurrentPage(1); }} 
                            />
                        );
                    })}
                </>
            }
            toolbarLeft={
                <>
                    <ExportButtons onExportXLSX={handleExportXLSX} onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                    <div style={{ marginLeft: '8px', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', background: 'var(--bg-primary)' }}>
                        <select 
                            value={filterType} 
                            onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', cursor: 'pointer', color: 'var(--text-color)', fontWeight: 600, minWidth: '150px' }}
                        >
                            <option value="all">ทั้งหมด (ประเภทช่าง)</option>
                            {mechanicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </>
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาความชำนาญ..." />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setForm({ name: '', description: '', status: 'active' }); setModal('add'); }}>
                        <Plus size={16} /> <span>เพิ่มความชำนาญ</span>
                    </button>
                </>
            }
        >
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px', textAlign: 'center' }}>ลำดับ</th>
                            <th>ชื่อความชำนาญ</th>
                            <th>ประเภทช่าง</th>
                            <th>คำอธิบาย</th>
                            <th style={{ textAlign: 'center', width: '120px' }}>สถานะ</th>
                            <th style={{ textAlign: 'center', width: '120px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((r, i) => (
                            <tr key={r.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(safePage - 1) * pageSize + i + 1}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                                <td>{r.mechanicType}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{r.description || '-'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <StatusDropdown 
                                        value={r.status || 'active'}
                                        onChange={async (val: any) => { 
                                            setData(prev => prev.map(x => x.id === r.id ? { ...x, status: val } : x));
                                            try { await api.updateMechanicExpertise(r.id, { ...r, status: val } as any); } catch(err){}
                                        }}
                                        options={[
                                            { value: 'active', label: 'ใช้งาน', color: 'green' },
                                            { value: 'inactive', label: 'ระงับ', color: 'red' }
                                        ]}
                                    />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button title="เรียกดู" style={crudStyles.viewBtn} onClick={() => { setSelected(r); setModal('view'); }}>
                                            <Eye size={15} />
                                        </button>
                                        <button title="แก้ไข" style={crudStyles.editBtn} onClick={() => { setForm({ name: r.name, mechanicType: r.mechanicType, description: r.description, status: r.status || 'active' }); setSelected(r); setFormErrors({}); setModal('edit'); }}>
                                            <Pencil size={15} />
                                        </button>
                                        <button title="ลบ" style={crudStyles.deleteBtn} onClick={() => { setSelected(r); setModal('delete'); }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paged.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลความชำนาญ</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={currentPage} pageSize={pageSize} totalItems={filtered.length}
                setCurrentPage={setCurrentPage} setPageSize={setPageSize}
            />

            <BaseModal
                isOpen={!!modal}
                onClose={() => setModal(null)}
                title={modal === 'view' ? 'ข้อมูลความชำนาญ' : modal === 'add' ? 'เพิ่มความชำนาญ' : modal === 'edit' ? 'แก้ไขความชำนาญ' : 'ยืนยันการลบ'}
                width="520px"
                footer={
                    <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        {modal === 'delete' ? (
                            <button className="btn btn-sm" style={{ background: 'var(--accent-red)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDelete}>
                                <Trash2 size={16} /> ยืนยันการลบ
                            </button>
                        ) : modal !== 'view' && (
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={!form.name}>{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        )}
                    </>
                }
            >
                {modal === 'view' && selected && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            ['ID', selected.id],
                            ['ชื่อความชำนาญ', selected.name],
                            ['ประเภทช่าง', selected.mechanicType],
                            ['สถานะ', selected.status === 'active' ? 'ใช้งาน' : '❌ ระงับ'],
                            ['คำอธิบาย', selected.description || '-'],
                        ].map(([l, v], i) => (
                            <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', ...(l === 'คำอธิบาย' ? { gridColumn: 'span 2' } : {}) }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{l}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                )}
                
                {(modal === 'add' || modal === 'edit') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={crudStyles.label}>ชื่อความชำนาญ *</label>
                            <input style={crudStyles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="เช่น เครื่องยนต์ดีเซล, ระบบเบรก" />
                            {formErrors.name && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
                        </div>
                        <div>
                            <label style={crudStyles.label}>ประเภทช่าง *</label>
                            <select style={crudStyles.input} value={form.mechanicType} onChange={e => setForm({ ...form, mechanicType: e.target.value })}>
                                {mechanicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={crudStyles.label}>สถานะ</label>
                            <select style={crudStyles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="active">ใช้งาน</option>
                                <option value="inactive">❌ ระงับ</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={crudStyles.label}>คำอธิบาย</label>
                            <input style={crudStyles.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="อธิบายเพิ่มเติมเกี่ยวกับความชำนาญ" />
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
        </CrudLayout>
    );
}

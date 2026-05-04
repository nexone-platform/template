'use client';
import React, { useState, useEffect } from 'react';
import CrudLayout from '@/components/CrudLayout';
import StatusDropdown from '@/components/StatusDropdown';
import { SummaryCard, SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import Pagination from '@/components/Pagination';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Eye, Edit2, Trash2, X, Wrench, Phone, Star, CheckCircle, ShieldCheck, Tags, Box } from 'lucide-react';
import { api, Mechanic as APIMechanic } from '@/services/api';
import { useSystemConfig } from '@nexone/ui';

interface Mechanic {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    address: string;
    rating: number;
    status: string;
    experience: number;
    certifications: string;
    notes: string;
}

const specialties = ['เครื่องยนต์ดีเซล', 'ระบบเบรก', 'ระบบไฟฟ้า', 'ช่วงล่าง', 'ระบบแอร์', 'งานตัวถัง/ทำสี', 'เกียร์/คลัทช์', 'ซ่อมทั่วไป'];
const statusLabels: Record<string, string> = { active: '✅ ใช้งาน', inactive: '⛔ ปิดใช้งาน' };

const emptyForm: Partial<Mechanic> = { 
    name: '', specialty: 'ซ่อมทั่วไป', phone: '', address: '', rating: 4.0, status: 'active', experience: 0, certifications: '', notes: '' 
};

const mapToDisplay = (r: APIMechanic): Mechanic => ({
    id: r.id, name: r.name, specialty: r.specialization, phone: r.phone, address: r.address, 
    rating: r.rating, status: r.status, experience: r.experience, certifications: r.certification, notes: r.notes 
});

const mapToAPI = (f: Partial<Mechanic>): Partial<APIMechanic> => ({
    ...f, specialization: f.specialty, certification: f.certifications 
} as Partial<APIMechanic>);

export default function MechanicsPage() {
    const [data, setData] = useState<Mechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
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
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [selected, setSelected] = useState<Mechanic | null>(null);
    const [form, setForm] = useState<Partial<Mechanic>>(emptyForm);

    const loadData = async () => {
        try {
            const res = await api.getMechanics();
            setData((res || []).map(mapToDisplay));
        } catch (err) {
            console.error('Failed to load mechanics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const baseData = data.filter(r => 
        !search || 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.specialty.includes(search) || 
        r.id.toLowerCase().includes(search.toLowerCase())
    );

    const filteredData = baseData.filter(r => {
        if (filterType === 'all') return true;
        return r.specialty === filterType;
    });

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSave = async () => {
        try {
            if (modalMode === 'add') {
                const newId = `MCH-${String(data.length + 1).padStart(3, '0')}`;
                await api.createMechanic({ ...mapToAPI(form), id: newId });
            } else if (modalMode === 'edit' && selected) {
                await api.updateMechanic(selected.id, mapToAPI(form));
            }
            await loadData();
        } catch (err) {
            console.error('Failed to save mechanic', err);
        }
        setModalMode(null);
    };

    const handleDelete = async () => {
        if (selected) {
            try {
                await api.deleteMechanic(selected.id);
                await loadData();
            } catch (err) {
                console.error('Failed to delete mechanic', err);
            }
        }
        setModalMode(null);
    };

    // Get unique specialties
    const uniqueCategories = Array.from(new Set(data.map(item => item.specialty)));

    const exportCols = [
        { header: 'รหัส', key: 'id' },
        { header: 'ชื่อ', key: 'name' },
        { header: 'ความชำนาญ', key: 'specialty' },
        { header: 'โทร', key: 'phone' },
        { header: 'ที่อยู่', key: 'address' },
        { header: 'Rating', key: 'rating' },
        { header: 'ประสบการณ์ (ปี)', key: 'experience' },
        { header: 'สถานะ', key: 'status', format: (val: any) => statusLabels[val] || val }
    ];

    if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>;

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard 
                        title="รายการทั้งหมด" 
                        value={baseData.length} 
                        icon={<Tags size={22} />} 
                        color="#3b82f6"
                        isActive={filterType === 'all'} 
                        onClick={() => { setFilterType('all'); setCurrentPage(1); }} 
                    />
                    {uniqueCategories.map((category, index) => {
                        const count = baseData.filter(i => i.specialty === category).length;
                        const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                        const color = colors[index % colors.length];
                        return (
                            <SummaryCard 
                                key={category}
                                title={category} 
                                value={count} 
                                icon={<Box size={22} />} 
                                color={color}
                                isActive={filterType === category} 
                                onClick={() => { setFilterType(category); setCurrentPage(1); }} 
                            />
                        );
                    })}
                </>
            }
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Mechanics', exportCols)}
                    onExportCSV={() => exportToCSV(filteredData, 'Mechanics', exportCols)}
                    onExportPDF={() => exportToPDF(filteredData, 'Mechanics', exportCols, 'Mechanics Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาชื่อ, ความชำนาญ..." />
                    <button onClick={() => { setForm(emptyForm); setModalMode('add'); }} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}>
                        <Plus size={16} /> <span>เพิ่มช่าง</span>
                    </button>
                </>
            }
        >
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>รหัส</th>
                            <th>ชื่อ</th>
                            <th>ความชำนาญ</th>
                            <th>โทร</th>
                            <th>RATING</th>
                            <th className="text-center" style={{ width: '140px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '120px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(r => (
                            <tr key={r.id}>
                                <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{r.id}</span></td>
                                <td><span className="font-medium">{r.name}</span></td>
                                <td>{r.specialty}</td>
                                <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} />{r.phone}</div></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                                        {'⭐'.repeat(Math.round(r.rating))} <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{r.rating}</span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <StatusDropdown 
                                        value={r.status}
                                        onChange={async (newValue: any) => {
                                            setData(prev => prev.map(x => x.id === r.id ? { ...x, status: newValue } : x));
                                            try { await api.updateMechanic(r.id, { ...r, status: newValue } as any); } catch(err) { console.error(err); }
                                        }}
                                        options={[
                                            { value: 'active', label: 'ใช้งาน', color: 'green' },
                                            { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' }
                                        ]}
                                    />
                                </td>
                                <td className="text-center">
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button className="btn-icon btn-icon-view" title="ดู" onClick={() => { setSelected(r); setModalMode('view'); }}><Eye size={14} /></button>
                                        <button className="btn-icon btn-icon-edit" title="แก้ไข" onClick={() => { setForm({ ...r }); setSelected(r); setModalMode('edit'); }}><Edit2 size={14} /></button>
                                        <button className="btn-icon btn-icon-delete" title="ลบ" onClick={() => { setSelected(r); setModalMode('delete'); }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบรายการ</td></tr>
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
                isOpen={!!modalMode && modalMode !== 'delete'} 
                onClose={() => setModalMode(null)}
                title={modalMode === 'add' ? 'เพิ่มช่าง' : modalMode === 'edit' ? 'แก้ไขข้อมูล' : 'รายละเอียดผู้ซ่อม'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setModalMode(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} disabled={!form.name?.trim()}>
                                {modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setModalMode(null)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {modalMode === 'view' && selected ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[['รหัส', selected.id], ['ชื่อ', selected.name], ['ความชำนาญ', selected.specialty], ['โทร', selected.phone], ['ที่อยู่', selected.address], ['Rating', `${selected.rating} ⭐`], ['ประสบการณ์', `${selected.experience} ปี`], ['ใบรับรอง', selected.certifications || '-'], ['สถานะ', statusLabels[selected.status]]].map(([l, v], i) => 
                                <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{l}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{v}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={crudStyles.label}>ชื่อ <span style={{color: '#ef4444'}}>*</span></label>
                                <input style={crudStyles.input} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ระบุชื่อช่าง" />
                            </div>
                            <div>
                                <label style={crudStyles.label}>ความชำนาญ</label>
                                <select style={crudStyles.input} value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={crudStyles.label}>โทร</label>
                                <input style={crudStyles.input} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ex: 08x-xxx-xxxx" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={crudStyles.label}>ที่อยู่</label>
                                <input style={crudStyles.input} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="ที่อยู่" />
                            </div>
                            <div>
                                <label style={crudStyles.label}>ประสบการณ์ (ปี)</label>
                                <input type="number" style={crudStyles.input} value={form.experience || 0} onChange={e => setForm({ ...form, experience: +e.target.value })} />
                            </div>
                            <div>
                                <label style={crudStyles.label}>สถานะ</label>
                                <StatusDropdown 
                                    value={form.status || 'active'} 
                                    onChange={(val: any) => {
                                        setForm(prev => ({ ...prev, status: val }));
                                    }} 
                                    options={[
                                        { value: 'active', label: 'ใช้งาน', color: 'green' },
                                        { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' }
                                    ]}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={crudStyles.label}>ใบรับรอง/ใบผ่านงาน</label>
                                <input style={crudStyles.input} value={form.certifications || ''} onChange={e => setForm({ ...form, certifications: e.target.value })} placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={crudStyles.label}>หมายเหตุ</label>
                                <textarea style={{ ...crudStyles.input, minHeight: '80px', resize: 'vertical' }} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="ข้อมูลเพิ่มเติม..." />
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            <BaseModal
                isOpen={modalMode === 'delete'}
                onClose={() => setModalMode(null)}
                title="ยืนยันการลบข้อมูล"
                footer={
                    <>
                        <button onClick={() => setModalMode(null)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                        <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>คุณต้องการลบข้อมูล <strong>{selected?.name || 'รายการนี้'}</strong> ใช่หรือไม่?</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}

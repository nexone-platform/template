'use client';

import React, { useState, useEffect } from 'react';
import { Truck, ParkingCircle, MapPin, Eye, Pencil, Trash2, Plus, Banknote } from 'lucide-react';
import { api, ParkingLot as APIParkingLot, ParkingType as APIParkingType } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, ExportButtons, SearchInput, BaseModal, crudStyles } from '@/components/CrudComponents';
import StatusDropdown from '@/components/StatusDropdown';
import Pagination from '@/components/Pagination';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';

interface ParkingLot { 
    id: string; 
    name: string; 
    address: string; 
    totalSlots: number; 
    usedSlots: number; 
    type: string; 
    facilties: string; 
    contactPerson: string; 
    phone: string; 
    monthlyRent: number; 
    status: string; 
    notes: string; 
}


const statusLabels: Record<string, string> = { active: 'ใช้งาน', full: 'เต็ม', inactive: 'ปิดใช้งาน' };

// Map logic
const emptyForm: Partial<ParkingLot> = { name: '', address: '', totalSlots: 0, usedSlots: 0, facilties: '', contactPerson: '', phone: '', monthlyRent: 0, status: 'active', notes: '' };
const mapToDisplay = (r: APIParkingLot): ParkingLot => ({ ...r, facilties: r.facilities || '' });
const mapToAPI = (f: Partial<ParkingLot>): Partial<APIParkingLot> => ({ ...f, facilities: f.facilties } as Partial<APIParkingLot>);

const exportConfigs = [
    { label: 'รหัส', key: 'id' },
    { label: 'ชื่อ', key: 'name' },
    { label: 'ประเภท', key: 'type' },
    { label: 'ที่อยู่', key: 'address' },
    { label: 'ช่องจอด', key: 'totalSlots' },
    { label: 'ใช้งาน', key: 'usedSlots' },
    { label: 'ว่าง', key: 'free', format: (item: any) => item.totalSlots - item.usedSlots },
    { label: 'ค่าเช่า/เดือน', key: 'monthlyRent' },
    { label: 'สถานะ', key: 'status', format: (item: any) => statusLabels[item.status] || item.status }
];

export default function ParkingPage() {
    const [data, setData] = useState<ParkingLot[]>([]);
    const [search, setSearch] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [newType, setNewType] = useState('');
    const [selected, setSelected] = useState<ParkingLot | null>(null);
    const [form, setForm] = useState<Partial<ParkingLot>>(emptyForm);
    const [pageSize, setPageSize] = useState(10);
    const [dbParkingTypes, setDbParkingTypes] = useState<APIParkingType[]>([]);

    const loadData = async () => { 
        try { 
            const [res, typesRes] = await Promise.all([
                api.getParkingLots(),
                api.getParkingTypes()
            ]);
            setData((res || []).map(mapToDisplay)); 
            setDbParkingTypes((typesRes || []) as unknown as APIParkingType[]);
        } catch { } 
    };

    useEffect(() => { loadData(); }, []);

    const [filterMode, setFilterMode] = useState<'all' | 'used' | 'free' | 'rent'>('all');

    const filtered = data.filter(r => {
        const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.type.includes(search) || r.id.toLowerCase().includes(search.toLowerCase());
        
        let matchFilter = true;
        if (filterMode === 'used') matchFilter = r.usedSlots > 0;
        else if (filterMode === 'free') matchFilter = (r.totalSlots - r.usedSlots) > 0;
        else if (filterMode === 'rent') matchFilter = r.monthlyRent > 0;

        return matchSearch && matchFilter;
    });
    
    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    // Summary logic
    const totalSlots = data.reduce((s, r) => s + (r.totalSlots || 0), 0);
    const totalUsed = data.reduce((s, r) => s + (r.usedSlots || 0), 0);
    const totalRent = data.reduce((s, r) => s + (r.monthlyRent || 0), 0);

    const handleSave = async () => { 
        try { 
            if (modal === 'add') { 
                await api.createParkingLot({ ...mapToAPI(form), id: `PKG-${String(data.length + 1).padStart(3, '0')}` }); 
            } else if (modal === 'edit' && selected) { 
                await api.updateParkingLot(selected.id, mapToAPI(form)); 
            } 
            await loadData(); 
        } catch { } 
        setModal(null); 
    };

    const handleDelete = async () => { 
        if (selected) { 
            try { 
                await api.deleteParkingLot(selected.id); 
                await loadData(); 
            } catch { } 
        } 
        setModal(null); 
    };

    const handleExportXLSX = () => exportToXLSX(filtered, 'Parking', exportConfigs);
    const handleExportCSV = () => exportToCSV(filtered, 'Parking', exportConfigs);
    const handleExportPDF = () => exportToPDF(filtered, 'Parking', exportConfigs, 'รายงานลานจอดรถ');

    const summaryCards = (
        <>
            <SummaryCard icon={<ParkingCircle />} title="ลานจอดทั้งหมด" count={data.length} subtitle="แห่ง" color="#3b82f6" isActive={filterMode === 'all'} onClick={() => { setFilterMode('all'); setCurrentPage(1); }} />
            <SummaryCard icon={<Truck />} title="ใช้งาน" count={totalUsed} subtitle="ช่อง" color="#f59e0b" isActive={filterMode === 'used'} onClick={() => { setFilterMode('used'); setCurrentPage(1); }} />
            <SummaryCard icon={<Truck />} title="ว่าง" count={totalSlots - totalUsed} subtitle="ช่อง" color="#8b5cf6" isActive={filterMode === 'free'} onClick={() => { setFilterMode('free'); setCurrentPage(1); }} />
            <SummaryCard icon={<Banknote />} title="ค่าเช่ารวม/เดือน" count={`฿${totalRent.toLocaleString()}`} subtitle="" color="#10b981" isActive={filterMode === 'rent'} onClick={() => { setFilterMode('rent'); setCurrentPage(1); }} />
        </>
    );

    const toolbarLeft = (
        <ExportButtons onExportXLSX={handleExportXLSX} onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
    );

    const toolbarRight = (
        <>
            <SearchInput value={search} onChange={(val) => { setSearch(val); setCurrentPage(1); }} placeholder="ค้นหาลานจอด..." />
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setForm({ name: '', type: '', address: '', totalSlots: 0, usedSlots: 0, facilties: '', contactPerson: '', phone: '', status: 'active', monthlyRent: 0 }); setModal('add'); }}>
                <Plus size={16} /> <span>เพิ่มลานจอด</span>
            </button>
        </>
    );

    return (
        <CrudLayout
            summaryCards={summaryCards}
            toolbarLeft={toolbarLeft}
            toolbarRight={toolbarRight}
        >
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>รหัส</th>
                            <th>ชื่อ</th>
                            <th>ประเภท</th>
                            <th>ช่องจอด</th>
                            <th>ใช้งาน</th>
                            <th>ว่าง</th>
                            <th>ค่าเช่า/เดือน</th>
                            <th>สถานะ</th>
                            <th style={{ textAlign: 'center', width: '110px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map(r => { 
                            const avail = r.totalSlots - r.usedSlots; 
                            return (
                                <tr key={r.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{r.id}</span></td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{r.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={10} />{r.address}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{r.type}</td>
                                    <td style={{ fontWeight: 600 }}>{r.totalSlots}</td>
                                    <td>{r.usedSlots}</td>
                                    <td><span style={{ color: avail <= 2 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>{avail}</span></td>
                                    <td>{r.monthlyRent > 0 ? `฿${r.monthlyRent.toLocaleString()}` : '-'}</td>
                                    <td>
                                        <StatusDropdown 
                                            value={r.status}
                                            onChange={async (newValue: any) => {
                                                setData(prev => prev.map(x => x.id === r.id ? { ...x, status: newValue } : x));
                                                try { await api.updateParkingLot(r.id, { ...r, status: newValue } as any); } catch(err) { console.error(err); }
                                            }}
                                            hideIcon={true}
                                            options={Object.keys(statusLabels).map(k => ({ 
                                                value: k, 
                                                label: statusLabels[k as keyof typeof statusLabels], 
                                                color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                                            }))}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <button style={crudStyles.viewBtn} onClick={() => { setSelected(r); setModal('view'); }}><Eye size={15} /></button>
                                            <button style={crudStyles.editBtn} onClick={() => { setForm({ ...r }); setSelected(r); setModal('edit'); }}><Pencil size={15} /></button>
                                            <button style={crudStyles.deleteBtn} onClick={() => { setSelected(r); setModal('delete'); }}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ) 
                        })}
                        {paged.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    ไม่พบรายการ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 0 && (
                <Pagination 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filtered.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* Modals */}
            <BaseModal
                isOpen={modal === 'add' || modal === 'edit'}
                title={modal === 'add' ? '➕ เพิ่มลานจอด' : '✏️ แก้ไข'}
                onClose={() => setModal(null)}
                footer={
                    <>
                        <button onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}  >{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={lbl}>ชื่อ</label>
                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ ...lbl, marginBottom: 0 }}>ประเภท</label>
                            <button 
                                onClick={(e) => { e.preventDefault(); setIsTypeModalOpen(true); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                                title="เพิ่มประเภทลานจอดรถใหม่"
                            >
                                <Plus size={12} /> เพิ่มประเภท
                            </button>
                        </div>
                        <select className="form-input" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%' }}>
                            {dbParkingTypes.filter(t => t.status === 'active').map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>ช่องจอด</label>
                        <input className="form-input" type="number" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: +e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={lbl}>ผู้ดูแล</label>
                        <input className="form-input" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={lbl}>ค่าเช่า/เดือน</label>
                        <input className="form-input" type="number" value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: +e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={lbl}>ที่อยู่</label>
                        <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={lbl}>สิ่งอำนวยความสะดวก</label>
                        <input className="form-input" value={form.facilties} onChange={e => setForm({ ...form, facilties: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>
            </BaseModal>

            <BaseModal
                isOpen={isTypeModalOpen}
                title="➕ เพิ่มประเภทลานจอดรถ"
                onClose={() => { setIsTypeModalOpen(false); setNewType(''); }}
                footer={
                    <>
                        <button onClick={() => { setIsTypeModalOpen(false); setNewType(''); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button 
                            onClick={async () => {
                                if (!newType.trim()) return;
                                try {
                                    const newTypeObj = { name: newType.trim(), description: '', status: 'active' };
                                    await api.createParkingType(newTypeObj as unknown as APIParkingType);
                                    const typesRes = await api.getParkingTypes();
                                    setDbParkingTypes((typesRes || []) as unknown as APIParkingType[]);
                                    setForm(f => ({ ...f, type: newType.trim() }));
                                    setNewType('');
                                    setIsTypeModalOpen(false);
                                } catch (err) {
                                    console.error(err);
                                }
                            }} 
                            style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                        >
                            บันทึกข้อมูล
                        </button>
                    </>
                }
            >
                <div>
                    <label style={lbl}>ชื่อประเภทลานจอดรถ</label>
                    <input 
                        className="form-input" 
                        value={newType} 
                        onChange={e => setNewType(e.target.value)} 
                        style={{ width: '100%' }} 
                        placeholder="ระบุชื่อประเภท"
                        autoFocus
                    />
                </div>
            </BaseModal>

            <BaseModal
                isOpen={modal === 'view'}
                title={`🅿️ ${selected?.name || ''}`}
                onClose={() => setModal(null)}
                footer={
                    <button onClick={() => setModal(null)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                }
            >
                {selected && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            ['รหัส', selected.id], 
                            ['ชื่อ', selected.name], 
                            ['ประเภท', selected.type], 
                            ['ที่อยู่', selected.address], 
                            ['ช่องจอด', `${selected.totalSlots} ช่อง`], 
                            ['ใช้งาน', `${selected.usedSlots} ช่อง`], 
                            ['ว่าง', `${selected.totalSlots - selected.usedSlots} ช่อง`], 
                            ['สิ่งอำนวยความสะดวก', selected.facilties], 
                            ['ผู้ดูแล', selected.contactPerson], 
                            ['โทร', selected.phone], 
                            ['ค่าเช่า/เดือน', selected.monthlyRent > 0 ? `฿${selected.monthlyRent.toLocaleString()}` : '-']
                        ].map(([l, v], i) => (
                            <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{l}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                )}
            </BaseModal>

            <BaseModal
                isOpen={modal === 'delete'}
                title="⚠️ ยืนยันลบ"
                onClose={() => setModal(null)}
                footer={
                    <>
                        <button onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                    ต้องการลบ <strong>{selected?.name}</strong> ใช่หรือไม่?
                </p>
            </BaseModal>
        </CrudLayout>
    );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' };

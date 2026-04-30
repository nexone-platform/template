'use client';

import React, { useState } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Search, Plus, Pencil, Trash2, X, CalendarClock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export interface MaintenanceSchedule {
    id: string;
    vehiclePlate: string;
    vehicleBrand: string;
    currentMileage: number;
    planName: string;
    criteriaType: 'ระยะทาง' | 'ระยะเวลา';
    targetValue: string | number; // e.g., 50000 or '2026-12-31'
    status: 'Upcoming' | 'Warning' | 'Overdue' | 'Done';
}

const mockVehicles = [
    { plate: '1กท-1234', brand: 'HINO', mileage: 48500 },
    { plate: '2กข-5678', brand: 'ISUZU', mileage: 120500 },
    { plate: '71-9988', brand: 'SCANIA', mileage: 85000 },
    { plate: '62-1122', brand: 'VOLVO', mileage: 104000 }
];

const mockPlans = [
    { name: 'เช็คระยะ 10,000 กม.', type: 'ระยะทาง' },
    { name: 'เช็คระยะ 50,000 กม.', type: 'ระยะทาง' },
    { name: 'เปลี่ยนยางทุก 2 ปี', type: 'ระยะเวลา' },
    { name: 'เช็คระบบแอร์รายปี', type: 'ระยะเวลา' }
];

const initialSchedules: MaintenanceSchedule[] = [
    { id: '1', vehiclePlate: '1กท-1234', vehicleBrand: 'HINO', currentMileage: 48500, planName: 'เช็คระยะ 50,000 กม.', criteriaType: 'ระยะทาง', targetValue: 50000, status: 'Warning' },
    { id: '2', vehiclePlate: '2กข-5678', vehicleBrand: 'ISUZU', currentMileage: 120500, planName: 'เช็คระบบแอร์รายปี', criteriaType: 'ระยะเวลา', targetValue: '2027-01-15', status: 'Upcoming' },
    { id: '3', vehiclePlate: '71-9988', vehicleBrand: 'SCANIA', currentMileage: 85000, planName: 'เปลี่ยนยางทุก 2 ปี', criteriaType: 'ระยะเวลา', targetValue: '2026-03-01', status: 'Overdue' },
    { id: '4', vehiclePlate: '62-1122', vehicleBrand: 'VOLVO', currentMileage: 104000, planName: 'เช็คระยะ 10,000 กม.', criteriaType: 'ระยะทาง', targetValue: 110000, status: 'Upcoming' }
];

export default function MaintenanceSchedulePage() {
    const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(initialSchedules);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editSchedule, setEditSchedule] = useState<MaintenanceSchedule | null>(null);
    const [form, setForm] = useState<Partial<MaintenanceSchedule>>({});
    const [showDelete, setShowDelete] = useState<MaintenanceSchedule | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filtered = schedules.filter(s =>
        s.vehiclePlate.includes(search) || s.planName.includes(search)
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleAdd = () => {
        setEditSchedule(null);
        setForm({
            vehiclePlate: mockVehicles[0].plate,
            vehicleBrand: mockVehicles[0].brand,
            currentMileage: mockVehicles[0].mileage,
            planName: mockPlans[0].name,
            criteriaType: mockPlans[0].type as any,
            targetValue: '',
            status: 'Upcoming'
        });
        setShowModal(true);
    };

    const handleEdit = (s: MaintenanceSchedule) => {
        setEditSchedule(s);
        setForm({ ...s });
        setShowModal(true);
    };

    const handleSave = () => {
        // Auto resolve brand and formatting
        const v = mockVehicles.find(v => v.plate === form.vehiclePlate);
        const p = mockPlans.find(p => p.name === form.planName);
        const data = {
            ...form,
            vehicleBrand: v?.brand || '',
            currentMileage: v?.mileage || 0,
            criteriaType: p?.type || 'ระยะทาง',
        } as MaintenanceSchedule;

        if (editSchedule) {
            setSchedules(prev => prev.map(s => s.id === editSchedule.id ? data : s));
        } else {
            data.id = Math.random().toString();
            setSchedules(prev => [data, ...prev]);
        }
        setShowModal(false);
    };

    const handleDelete = () => {
        if (showDelete) {
            setSchedules(prev => prev.filter(s => s.id !== showDelete.id));
            setShowDelete(null);
        }
    };

    const renderStatus = (status: string) => {
        if (status === 'Upcoming') return <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><Clock size={14} /> รอถึงกำหนด</span>;
        if (status === 'Warning') return <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><AlertTriangle size={14} /> ใกล้ถึงระยะ</span>;
        if (status === 'Overdue') return <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><AlertTriangle size={14} /> เลยกำหนดซ่อมบำรุง</span>;
        if (status === 'Done') return <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><CheckCircle size={14} /> ดำเนินการแล้ว</span>;
    };

    const renderProgress = (s: MaintenanceSchedule) => {
        if (s.criteriaType === 'ระยะทาง') {
            const pct = Math.min(100, Math.max(0, (s.currentMileage / (Number(s.targetValue) || 1)) * 100));
            const isDanger = pct > 95;
            const isWarning = pct > 85;
            return (
                <div style={{ width: '100%', minWidth: '150px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span>{s.currentMileage.toLocaleString()} กม.</span>
                        <span>{Number(s.targetValue).toLocaleString()} กม.</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${pct}%`, height: '100%',
                            background: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6',
                            borderRadius: '3px'
                        }} />
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{ minWidth: '150px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>ครบ: {s.targetValue}</span>
                </div>
            );
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }} />
                <div className="topbar-search" style={{ minWidth: '240px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหาทะเบียนรถ, แผน..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ทั้งหมด {filtered.length} รายการ</span>
                <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                <th>รถ (ทะเบียน / รุ่น)</th>
                                <th>รายการซ่อมบำรุง</th>
                                <th>ความคืบหน้า / กำหนดการ</th>
                                <th>สถานะ</th>
                                <th style={{ textAlign: 'center', width: '100px' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((s, i) => (
                                <tr key={s.id}>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(safePage - 1) * pageSize + i + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{s.vehiclePlate}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.vehicleBrand}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '14px', marginBottom: '2px' }}>{s.planName}</div>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                            background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)'
                                        }}>{s.criteriaType}</span>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        {renderProgress(s)}
                                    </td>
                                    <td>{renderStatus(s.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <button onClick={() => handleEdit(s)} title="แก้ไข" style={actionBtn}><Pencil size={15} /></button>
                                            <button onClick={() => setShowDelete(s)} title="ลบ" style={{ ...actionBtn, color: 'var(--accent-red)' }}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลแผนการซ่อมบำรุง</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
                        padding: '10px 16px', borderTop: '1px solid var(--border-color)', gap: '12px',
                    }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} จาก {filtered.length}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pgBtn(safePage <= 1)}><ChevronsLeft size={16} /></button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pgBtn(safePage <= 1)}><ChevronLeft size={16} /></button>
                            <span style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{safePage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pgBtn(safePage >= totalPages)}><ChevronRight size={16} /></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pgBtn(safePage >= totalPages)}><ChevronsRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarClock size={20} style={{ color: 'var(--accent-blue)' }} /> {editSchedule ? 'แก้ไขแผนซ่อมบำรุงรถ' : 'กำหนดแผนซ่อมบำรุงให้รถ'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={closeBtn}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelSt}>ทะเบียนรถ *</label>
                                    <select style={inputSt} value={form.vehiclePlate} onChange={e => {
                                        const v = mockVehicles.find(x => x.plate === e.target.value);
                                        setForm(p => ({ ...p, vehiclePlate: v?.plate, vehicleBrand: v?.brand, currentMileage: v?.mileage }));
                                    }}>
                                        {mockVehicles.map(v => <option key={v.plate} value={v.plate}>{v.plate} ({v.brand})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelSt}>รายการซ่อมบำรุง *</label>
                                    <select style={inputSt} value={form.planName} onChange={e => {
                                        const p = mockPlans.find(x => x.name === e.target.value);
                                        setForm(prev => ({ ...prev, planName: p?.name, criteriaType: p?.type as any }));
                                    }}>
                                        {mockPlans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(59,130,246,0.05)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(59,130,246,0.2)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={labelSt}>ประเภทเกณฑ์กำหนด</label>
                                            <input style={{ ...inputSt, background: 'var(--bg-card)', color: 'var(--text-muted)' }} value={form.criteriaType || 'ระยะทาง'} disabled />
                                        </div>
                                        <div>
                                            <label style={labelSt}>{form.criteriaType === 'ระยะทาง' ? 'ระยะไมล์เป้าหมาย (กม.) *' : 'ครบกำหนดวันที่ *'}</label>
                                            <input
                                                style={inputSt}
                                                type={form.criteriaType === 'ระยะเวลา' ? 'date' : 'number'}
                                                value={form.targetValue}
                                                onChange={e => setForm(p => ({ ...p, targetValue: e.target.value }))}
                                                placeholder={form.criteriaType === 'ระยะทาง' ? 'เช่น 50000' : ''}
                                            />
                                        </div>
                                    </div>
                                    {form.criteriaType === 'ระยะทาง' && (
                                        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            💡 เลขไมล์รถคันนี้ปัจจุบันอัปเดตอยู่ที่ <strong>{(form.currentMileage || 0).toLocaleString()} กม.</strong>
                                        </div>
                                    )}
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelSt}>สถานะ</label>
                                    <select style={inputSt} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                                        <option value="Upcoming">รอถึงกำหนด (Upcoming)</option>
                                        <option value="Warning">ใกล้ถึงระยะ (Warning)</option>
                                        <option value="Overdue">เลยกำหนดซ่อมบำรุง (Overdue)</option>
                                        <option value="Done">ดำเนินการแล้ว (Done)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={!form.vehiclePlate || !form.planName || !form.targetValue}>{showModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showDelete && (
                <div className="modal-overlay" onClick={() => setShowDelete(null)}>
                    <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={20} /> ยืนยันลบแผน
                            </h3>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
                            <p>ต้องการลบแผนซ่อมบำรุงของรถ <strong>{showDelete.vehiclePlate}</strong> ({showDelete.planName}) ใช่หรือไม่?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button className="btn btn-sm" onClick={handleDelete}
                                style={{ background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>
                                🗑️ ลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const actionBtn: React.CSSProperties = { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--accent-amber)', transition: 'all 0.15s' };
const closeBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex' };
const labelSt: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' };
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' };
const pgBtn = (disabled: boolean): React.CSSProperties => ({ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, color: 'var(--text-secondary)' });

'use client';

import React, { useState, useEffect } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Search, Plus, Eye, Pencil, Trash2, X, Wrench, CheckCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { api, Vehicle, MaintenanceRecord } from '@/services/api';

// ========== Types (extended for display) ==========
interface MaintenanceDisplay extends MaintenanceRecord {
    plateNumber: string;
    category: string;
}

const maintenanceTypes: Record<string, string> = {
    'oil-change': '🛢️ เปลี่ยนถ่ายน้ำมันเครื่อง',
    'tire': '🛞 เปลี่ยนยาง',
    'brake': 'เบรก',
    'engine': '⚙️ เครื่องยนต์',
    'electrical': '⚡ ระบบไฟฟ้า',
    'body': '🚛 ตัวถัง',
    'suspension': '🔩 ช่วงล่าง',
    'general': '🔧 ซ่อมทั่วไป',
    'inspection': '🔍 ตรวจสภาพ',
};

const statusLabels: Record<string, string> = {
    scheduled: '⏳ รอดำเนินการ',
    'in-progress': '🔧 กำลังซ่อม',
    completed: 'เสร็จสิ้น',
    overdue: '⚠️ เลยกำหนด',
};

const statusColors: Record<string, string> = {
    scheduled: 'warning',
    'in-progress': 'blue',
    completed: 'green',
    overdue: 'red',
};

const emptyForm: Partial<MaintenanceRecord> = {
    vehicleId: '', type: 'เปลี่ยนถ่ายน้ำมันเครื่อง',
    description: '', scheduledDate: new Date().toISOString().split('T')[0],
    cost: 0, status: 'scheduled', mileageAt: 0, mechanic: '', garage: '', notes: '', priority: 'normal',
};

export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceDisplay[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<MaintenanceDisplay | null>(null);
    const [form, setForm] = useState<Partial<MaintenanceRecord>>(emptyForm);
    const perPage = 10;

    const loadData = async () => {
        try {
            const [mntData, vData] = await Promise.all([
                api.getMaintenanceRecords(),
                api.getVehicles()
            ]);
            setVehicles(vData);
            const vehicleMap = Object.fromEntries(vData.map(v => [v.id, v.plateNumber]));
            const display: MaintenanceDisplay[] = (mntData || []).map(r => ({
                ...r,
                plateNumber: vehicleMap[r.vehicleId] || r.vehicleId,
                category: r.type.includes('น้ำมัน') || r.type.includes('ยาง') || r.type.includes('ตรวจ') ? 'บำรุงรักษาตามระยะ' : 'ซ่อมแซม',
            }));
            setRecords(display);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // Filters
    const filtered = records.filter(r => {
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (filterType !== 'all' && r.type !== filterType) return false;
        if (search) {
            const q = search.toLowerCase();
            return r.id.toLowerCase().includes(q) || r.vehicleId.toLowerCase().includes(q) ||
                r.plateNumber.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) ||
                r.mechanic.toLowerCase().includes(q);
        }
        return true;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // KPIs
    const pending = records.filter(r => r.status === 'scheduled').length;
    const inProgress = records.filter(r => r.status === 'in-progress').length;
    const completed = records.filter(r => r.status === 'completed').length;
    const overdue = records.filter(r => r.status === 'overdue').length;
    const totalCost = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.cost, 0);

    // Handlers
    const handleAdd = () => { setForm(emptyForm); setModal('add'); };
    const handleView = (r: MaintenanceDisplay) => { setSelectedRecord(r); setModal('view'); };
    const handleEdit = (r: MaintenanceDisplay) => { setForm({ ...r }); setSelectedRecord(r); setModal('edit'); };
    const handleDeleteClick = (r: MaintenanceDisplay) => { setSelectedRecord(r); setModal('delete'); };

    const handleSave = async () => {
        try {
            if (modal === 'add') {
                const newId = `MNT-${String(records.length + 1).padStart(3, '0')}`;
                await api.createMaintenanceRecord({ ...form, id: newId });
            } else if (modal === 'edit' && selectedRecord) {
                await api.updateMaintenanceRecord(selectedRecord.id, form);
            }
            await loadData();
        } catch { /* ignore */ }
        setModal(null);
    };

    const handleDelete = async () => {
        if (selectedRecord) {
            try { await api.deleteMaintenanceRecord(selectedRecord.id); await loadData(); } catch { /* ignore */ }
        }
        setModal(null);
    };

    // ===== Export =====
    const exportCSV = () => {
        const header = 'รหัส,ทะเบียนรถ,ประเภทงาน,วันที่นัด,ค่าใช้จ่าย,ช่าง/อู่,สถานะ\n';
        const rows = filtered.map(r => `${r.id},${r.plateNumber},${maintenanceTypes[r.type] || r.type},${r.scheduledDate},${r.cost},${r.mechanic},${statusLabels[r.status]}`).join('\n');
        const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'maintenance.csv'; a.click(); URL.revokeObjectURL(url);
    };
    const exportXLSX = async () => {
        const XLSX = await import('xlsx');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const wsData = [
            ['รหัส', 'ทะเบียนรถ', 'ประเภทงาน', 'วันที่นัด', 'ค่าใช้จ่าย (บาท)', 'ช่าง/อู่', 'สถานะ'],
            ...filtered.map(r => [r.id, r.plateNumber, maintenanceTypes[r.type] || r.type, r.scheduledDate, r.cost, r.mechanic, statusLabels[r.status]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'บำรุงรักษา');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `nexspeed_maintenance_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url);
    };
    const exportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Maintenance Report - NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);
        let y = 32;
        const headers = ['ID', 'Plate', 'Type', 'Date', 'Cost', 'Mechanic', 'Status'];
        const colX = [14, 40, 70, 130, 160, 195, 240];
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont('helvetica', 'normal');
        y += 6;
        filtered.forEach(r => {
            if (y > 190) { doc.addPage(); y = 20; }
            const row = [r.id, r.plateNumber, (maintenanceTypes[r.type] || r.type).substring(0, 25), r.scheduledDate, String(r.cost), r.mechanic.substring(0, 20), r.status];
            row.forEach((val, i) => doc.text(val || '', colX[i], y));
            y += 5;
        });
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `nexspeed_maintenance_${new Date().toISOString().slice(0,10)}.pdf`; a.click(); URL.revokeObjectURL(url);
    };

    const eBtnStyle = (c: string): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
        background: 'transparent', border: `1.5px solid ${c}30`, borderRadius: '8px',
        color: c, fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* ScoreCards — FleetPage style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                    { icon: <Clock size={22} />, color: '#f59e0b', label: 'รอดำเนินการ', value: String(pending), sub: 'รายการ', bg: 'rgba(245,158,11,0.07)' },
                    { icon: <Wrench size={22} />, color: '#3b82f6', label: 'กำลังซ่อม', value: String(inProgress), sub: 'รายการ', bg: 'rgba(59,130,246,0.07)' },
                    { icon: <CheckCircle size={22} />, color: '#10b981', label: 'เสร็จสิ้น', value: String(completed), sub: 'รายการ', bg: 'rgba(16,185,129,0.07)' },
                    { icon: <AlertTriangle size={22} />, color: '#ef4444', label: 'เลยกำหนด', value: String(overdue), sub: 'รายการ', bg: 'rgba(239,68,68,0.07)' },
                    { icon: <Wrench size={22} />, color: '#8b5cf6', label: 'ค่าใช้จ่ายรวม', value: `\u0E3F${totalCost.toLocaleString()}`, sub: 'บาท', bg: 'rgba(139,92,246,0.07)' },
                ].map((card, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '16px 18px', borderRadius: '14px',
                        background: card.bg, border: '1px solid transparent', transition: 'all 0.2s',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: card.color, flexShrink: 0,
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{card.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>{card.value}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Export + Search + Filter + Add — FleetPage single row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={exportXLSX} style={eBtnStyle('#10b981')}><FileSpreadsheet size={14} /> XLSX</button>
                <button onClick={exportCSV} style={eBtnStyle('#10b981')}><FileText size={14} /> CSV</button>
                <button onClick={exportPDF} style={eBtnStyle('#ef4444')}><Download size={14} /> PDF</button>
                <div style={{ flex: 1 }} />
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทุกสถานะ</option>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทุกประเภทงาน</option>
                    {Object.entries(maintenanceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหา รหัส, ทะเบียน, ช่าง..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ทะเบียนรถ</th>
                                <th>ประเภทงาน</th>
                                <th>วันที่นัด</th>
                                <th>ค่าใช้จ่าย</th>
                                <th>ช่าง/อู่</th>
                                <th>สถานะ</th>
                                <th style={{ textAlign: 'center', width: '110px' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map(r => (
                                <tr key={r.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{r.id}</span></td>
                                    <td>{r.plateNumber || r.vehicleId}</td>
                                    <td>{maintenanceTypes[r.type] || r.type}</td>
                                    <td>{r.scheduledDate}</td>
                                    <td style={{ fontWeight: 600 }}>฿{r.cost.toLocaleString()}</td>
                                    <td>{r.mechanic}</td>
                                    <td><StatusDropdown 
                    value={r.status}
                    onChange={async (newValue: any) => {
                        setRecords(prev => prev.map(x => x.id === r.id ? { ...x, status: newValue } : x));
                        try { await api.updateMaintenanceRecord(r.id, { ...r, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                /></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <button className="btn-icon btn-icon-view" title="ดู" onClick={() => handleView(r)}><Eye size={14} /></button>
                                            <button className="btn-icon btn-icon-edit" title="แก้ไข" onClick={() => handleEdit(r)}><Pencil size={14} /></button>
                                            <button className="btn-icon btn-icon-delete" title="ลบ" onClick={() => handleDeleteClick(r)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบรายการ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>แสดง {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} จาก {filtered.length}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 10px' }}><ChevronLeft size={14} /></button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                <button key={p} className={`btn ${currentPage === p ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(p)} style={{ padding: '6px 12px', minWidth: '36px' }}>{p}</button>
                            ))}
                            <button className="btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 10px' }}><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Modals ===== */}
            {modal && (
                <div className="modal-backdrop" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: modal === 'delete' ? '400px' : '560px' }}>
                        {/* Delete confirm */}
                        {modal === 'delete' && selectedRecord && (
                            <>
                                <div className="modal-header">
                                    <h3 className="modal-title" style={{ color: 'var(--accent-red)' }}>⚠️ ยืนยันลบรายการ</h3>
                                    <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
                                </div>
                                <div className="modal-body">
                                    <p>ต้องการลบรายการ <strong>{selectedRecord.id}</strong> ({selectedRecord.description})?</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn" onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                                    <button className="btn btn-danger" onClick={handleDelete}>ลบ</button>
                                </div>
                            </>
                        )}

                        {/* View */}
                        {modal === 'view' && selectedRecord && (
                            <>
                                <div className="modal-header">
                                    <h3 className="modal-title">📋 {selectedRecord.id}</h3>
                                    <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
                                </div>
                                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        ['ทะเบียนรถ', selectedRecord.plateNumber || selectedRecord.vehicleId],
                                        ['ประเภทงาน', maintenanceTypes[selectedRecord.type]],
                                        ['หมวดหมู่', selectedRecord.category],
                                        ['วันที่นัด', selectedRecord.scheduledDate],
                                        ['วันที่เสร็จ', selectedRecord.completedDate || '-'],
                                        ['ค่าใช้จ่าย', `฿${selectedRecord.cost.toLocaleString()}`],
                                        ['เลขไมล์', `${(selectedRecord.mileageAt || 0).toLocaleString()} กม.`],
                                        ['อู่/ศูนย์ซ่อม', selectedRecord.garage || '-'],
                                        ['ช่าง/อู่', selectedRecord.mechanic],
                                        ['สถานะ', statusLabels[selectedRecord.status]],
                                    ].map(([label, value], i) => (
                                        <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn" onClick={() => setModal(null)}>ปิด</button>
                                </div>
                            </>
                        )}

                        {/* Add / Edit */}
                        {(modal === 'add' || modal === 'edit') && (
                            <>
                                <div className="modal-header">
                                    <h3 className="modal-title">{modal === 'add' ? '➕ เพิ่มรายการบำรุงรักษา' : '✏️ แก้ไขรายการ'}</h3>
                                    <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
                                </div>
                                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>รถ</label>
                                        <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={{ width: '100%' }}>
                                            <option value="">-- เลือกรถ --</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} • {v.plateNumber}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>ประเภทงาน</label>
                                        <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%' }}>
                                            {Object.entries(maintenanceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>วันที่นัด</label>
                                        <input className="form-input" type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>สถานะ</label>
                                        <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%' }}>
                                            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>ค่าใช้จ่าย (บาท)</label>
                                        <input className="form-input" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>เลขไมล์ ณ วันซ่อม</label>
                                        <input className="form-input" type="number" value={form.mileageAt} onChange={e => setForm({ ...form, mileageAt: +e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={labelStyle}>ช่าง / อู่</label>
                                        <input className="form-input" value={form.mechanic} onChange={e => setForm({ ...form, mechanic: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={labelStyle}>หมายเหตุ</label>
                                        <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: '100%', resize: 'vertical' }} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn" onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                                    <button className="btn btn-primary" onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', letterSpacing: '0.3px',
};
